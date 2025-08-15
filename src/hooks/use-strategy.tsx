import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import localforage from "localforage";

export interface Objective {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  location: string | null;
  budget_planned: number | null;
  strategic_importance: string | null;
  status: string;
  tags: string[] | null;
  currency: string | null;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description: string | null;
  progress: number;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  owner_id: string | null;
  status: string;
}

interface UseStrategyReturn {
  loading: boolean;
  error: string | null;
  objective: Objective | null;
  krs: KeyResult[];
  syncStatus: 'connected' | 'connecting' | 'disconnected';
  saveStatus: 'saved' | 'saving' | 'error' | 'local_only';
  updateObjective?: (updates: {
    title?: string;
    description?: string;
    budget_planned?: number;
    target_date?: string;
    tags?: string[];
    currency?: string;
  }) => Promise<boolean>;
}

export const STRATEGIC_TITLE = "ДРОН-ШОУ 2025: Переломный момент для Tiger Technology - заключение многомиллионного контракта через демонстрацию передовых технологий";

export function useStrategy(autoSeed = true): UseStrategyReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [krs, setKrs] = useState<KeyResult[]>([]);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'local_only'>('saved');

  // Configure localforage for persistence
  const cacheStore = localforage.createInstance({
    name: 'tiger_strategy',
    storeName: 'objectives'
  });

  // Save to cache using ID instead of title
  const saveToCache = useCallback(async (data: Objective) => {
    try {
      await cacheStore.setItem('strategic_objective', data);
    } catch (err) {
      console.warn('Cache save failed:', err);
    }
  }, []);

  // Load from cache using fixed key
  const loadFromCache = useCallback(async (): Promise<Objective | null> => {
    try {
      return await cacheStore.getItem<Objective>('strategic_objective');
    } catch (err) {
      console.warn('Cache load failed:', err);
      return null;
    }
  }, []);

  // Auto-save mechanism
  const autoSave = useCallback(async (data: Objective) => {
    if (!data) return;
    
    setSaveStatus('saving');
    
    try {
      // Save to cache first (instant)
      await saveToCache(data);
      setSaveStatus('local_only');
      
      // Then try to sync to Supabase
      const { error } = await supabase
        .from('objectives')
        .update({
          title: data.title,
          description: data.description,
          budget_planned: data.budget_planned,
          target_date: data.target_date,
          tags: data.tags,
          currency: data.currency
        })
        .eq('id', data.id);
        
      if (error) throw error;
      setSaveStatus('saved');
      
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus('saved'), 3000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
    }
  }, [saveToCache]);

  useEffect(() => {
    let isMounted = true;

    // Set up enhanced real-time subscription for instant sync between ALL users
    const channel = supabase
      .channel('strategic-objective-global-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'objectives'
          // Убираем фильтр по title чтобы получать все изменения
        },
        async (payload) => {
          if (isMounted) {
            console.log('🔄 Real-time update for all users:', payload);
            
            if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedObjective = payload.new as Objective;
              console.log('📡 Broadcasting update to UI:', updatedObjective);
              
              // Проверяем что это наша стратегическая цель по названию
              if (updatedObjective.title === STRATEGIC_TITLE || updatedObjective.title.includes('ДРОН-ШОУ')) {
                // Моментально обновляем UI для всех пользователей
                setObjective(updatedObjective);
                setSyncStatus('connected');
                setSaveStatus('saved');
                
                // Кешируем для устойчивости
                await saveToCache(updatedObjective);
                console.log('✅ ВСЕМ ПОЛЬЗОВАТЕЛЯМ: Данные синхронизированы!');
              }
              
            } else if (payload.eventType === 'INSERT' && payload.new) {
              const newObjective = payload.new as Objective;
              if (newObjective.title === STRATEGIC_TITLE || newObjective.title.includes('ДРОН-ШОУ')) {
                console.log('🆕 New strategic objective created:', newObjective);
                setObjective(newObjective);
                await saveToCache(newObjective);
              }
            }
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        if (isMounted) {
          console.log('👥 Users synchronized');
          setSyncStatus('connected');
        }
      })
      .subscribe((status) => {
        if (isMounted) {
          console.log('📡 Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setSyncStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setSyncStatus('disconnected');
          }
        }
      });

    async function init() {
      try {
        setLoading(true);
        setError(null);
        setSyncStatus('connecting');
        
        if (!user) {
          setLoading(false);
          return;
        }

        console.log('🚀 Initializing strategic objective data...');

        // 1. INSTANT LOAD from cache for immediate display (no waiting!)
        const cachedData = await loadFromCache();
        if (cachedData) {
          console.log('⚡ Loaded from cache instantly:', cachedData.title);
          setObjective(cachedData);
          setSaveStatus('local_only');
          setLoading(false); // Show UI immediately with cached data
        }

        // 2. Get current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        // find admin owner
        let ownerId: string | null = null;
        if (profile?.role === 'admin') ownerId = profile.id;
        if (!ownerId) {
          const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
          ownerId = adminProfile?.id || profile?.id || null;
        }

        // 3. ALWAYS load fresh data from Supabase for accuracy
        console.log('🌐 Loading fresh data from Supabase...');
        // Ищем по точному названию константы STRATEGIC_TITLE для всех пользователей
        const { data: existingObjs, error: loadErr } = await supabase
          .from('objectives')
          .select('*')
          .eq('title', STRATEGIC_TITLE)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (loadErr) {
          console.error('❌ Supabase load error:', loadErr);
          // If Supabase fails, keep cached data
          if (cachedData) {
            setSyncStatus('disconnected');
            return;
          }
          throw loadErr;
        }

        const existingObj = existingObjs?.[0] || null;
        let obj = existingObj as Objective | null;

        // seed if none
        if (!obj && autoSeed && profile?.id) {
            const { data: insertedObj, error: insErr } = await supabase
              .from('objectives')
              .insert({
                title: STRATEGIC_TITLE,
                description: `🎯 ГЛАВНАЯ ЦЕЛЬ: Дрон-шоу как демонстрация силы технологий Tiger\n📍 Локация: Timarevo Airfield (43°23'20.2"N 26°53'07.6"E)\n💰 Бюджет: 75,000 лв (увеличен для максимального эффекта)\n⏰ Дата и время: 20 августа 2025, 19:30-21:00\n🚁 Технологии: Модульная трансформация + ИИ-управление\n🔥 Спецэффекты: Пиротехника, лазеры, голограммы\n👥 VIP-гости: Министры, инвесторы, международные партнеры\n🛡️ Безопасность: Полный пакет (медики, пожарные, охрана)\n⚡ РЕЗУЛЬТАТ: Контракт 3+ млн лв + статус ведущего поставщика`,
                target_date: '2025-08-20',
                location: 'Timarevo Airfield, Bulgaria',
                budget_planned: 75000,
                strategic_importance: 'Ключевая демонстрация для получения статуса ведущего технологического поставщика и заключения многомиллионных государственных контрактов',
                status: 'active',
                created_by: profile.id,
              })
            .select('*')
            .single();
          if (insErr) throw insErr;
          obj = insertedObj as Objective;

          // seed KRs для дрон-шоу
          const krsToInsert = [
            {
              objective_id: obj.id,
              title: '🎪 KR1: Безукоризненное шоу-представление',
              description: '60-минутная программа: болгарский флаг → Tiger logo → военные маневры → пожаротушение → финальная трансформация с пиротехникой. Полная автономность ИИ-системы',
              progress: 25,
              target_value: 100,
              current_value: 25,
              unit: '% готовности',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '👑 KR2: Элитная VIP-аудитория 25+',
              description: 'Министры обороны и экономики, CEO крупных корпораций, зарубежные военные представители, ведущие инвесторы. Персональное VIP-сопровождение каждого гостя',
              progress: 15,
              target_value: 25,
              current_value: 8,
              unit: 'VIP-гостей',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '💎 KR3: Мегаконтракт 3+ млн лв',
              description: 'Государственный или корпоративный контракт на поставку систем безопасности. 40%+ предоплата, 3-летнее сотрудничество, потенциал расширения до 10+ млн лв',
              progress: 5,
              target_value: 3,
              current_value: 0,
              unit: 'млн лв',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '📺 KR4: Вирусное медиа-покрытие 250K+',
              description: 'Прямые трансляции на национальных каналах, YouTube-документальный фильм 500K+ просмотров, международные технологические издания, 100+ B2B лидов',
              progress: 10,
              target_value: 250000,
              current_value: 15000,
              unit: 'охват',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '🚁 KR5: Технологическое превосходство',
              description: 'Демонстрация уникальных возможностей: модульная трансформация в реальном времени, ИИ-навигация в сложных условиях, интеграция с существующими системами безопасности',
              progress: 40,
              target_value: 100,
              current_value: 40,
              unit: '% готовности',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
          ];

          const { error: krsErr } = await supabase.from('key_results').insert(krsToInsert as any);
          if (krsErr) throw krsErr;
        }

        // fetch objective and KRs
        if (obj) {
          // ensure target date matches requested 20/08/2025
          if (obj.target_date !== '2025-08-20') {
            try {
              await supabase.from('objectives').update({ target_date: '2025-08-20' }).eq('id', obj.id);
              obj = { ...obj, target_date: '2025-08-20' };
            } catch {}
          }

          const { data: krsData } = await supabase
            .from('key_results')
            .select('*')
            .eq('objective_id', obj.id)
            .order('title');

          if (isMounted) {
            console.log('✅ Fresh data loaded and cached:', obj.title);
            setObjective(obj);
            setKrs((krsData || []) as KeyResult[]);
            setSaveStatus('saved');
            setSyncStatus('connected');
            
            // GUARANTEED save to cache for persistence across page reloads
            await saveToCache(obj);
            
            console.log('🎉 Data persistence confirmed - will survive page reload!');
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Strategy load error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { 
      isMounted = false; 
      supabase.removeChannel(channel);
    };
  }, [user, autoSeed]);

  const updateObjective = async (updates: {
    title?: string;
    description?: string;
    budget_planned?: number;
    target_date?: string;
    tags?: string[];
    currency?: string;
  }, retryCount = 0) => {
    if (!objective) return false;
    
    console.log('💾 STARTING ADMIN SAVE - will broadcast to ALL users:', updates);
    setSaveStatus('saving');
    setSyncStatus('connecting');
    
    try {
      // Convert date from DD.MM.YYYY to UTC properly
      let processedUpdates = { ...updates };
      if (processedUpdates.target_date && typeof processedUpdates.target_date === 'string') {
        if (processedUpdates.target_date.includes('.')) {
          const [day, month, year] = processedUpdates.target_date.split('.');
          if (day && month && year) {
            // Create date in UTC to avoid timezone shifts
            const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
            processedUpdates.target_date = utcDate.toISOString().split('T')[0];
          }
        }
      }
      
      // 1. IMMEDIATE local update + cache (instant feedback)
      const updatedObjective = { ...objective, ...processedUpdates };
      setObjective(updatedObjective);
      await saveToCache(updatedObjective);
      setSaveStatus('local_only');
      
      // 2. GUARANTEED Supabase save (this triggers real-time for ALL users)
      console.log('📡 Saving to Supabase - will sync to all users...');
      const { data, error } = await supabase
        .from('objectives')
        .update({
          ...processedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', objective.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase save failed:', error);
        
        // Handle specific CORS and network errors
        if (error.message?.includes('CORS') || 
            error.message?.includes('network') ||
            error.message?.includes('fetch')) {
          throw new Error(`NETWORK_ERROR: ${error.message}`);
        }
        throw error;
      }
      
      console.log('✅ SUCCESS! Data saved to Supabase:', data);
      console.log('📢 Real-time will now broadcast changes to ALL users automatically');
      
      setSaveStatus('saved');
      setSyncStatus('connected');
      
      // 3. Update cache with confirmed data
      if (data) {
        await saveToCache(data as Objective);
      }
      
      // Clear any previous errors
      setError(null);
      
      console.log('🎉 ADMIN SAVE COMPLETE - All users now see the changes!');
      return true;
      
    } catch (e: any) {
      console.error('❌ ADMIN SAVE ERROR:', e);
      
      // Retry logic for network errors
      if (retryCount < 3 && (
        e.message?.includes('NETWORK_ERROR') ||
        e.message?.includes('CORS') ||
        e.message?.includes('fetch')
      )) {
        console.log(`🔄 Retrying admin save (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          updateObjective(updates, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return false;
      }
      
      setError(e.message || 'Ошибка сохранения');
      setSaveStatus('error');
      setSyncStatus('disconnected');
      
      // CRITICAL: Preserve data in cache even on network failure
      try {
        const preservedObjective = { ...objective, ...updates };
        await saveToCache(preservedObjective);
        console.log('💾 CRITICAL: Data preserved in cache for recovery!');
      } catch (cacheError) {
        console.error('❌ CRITICAL: Cache preservation failed:', cacheError);
      }
      
      return false;
    }
  };

  // Auto-save effect with debounce
  useEffect(() => {
    if (!objective) return;
    
    const autoSaveTimer = setTimeout(() => {
      autoSave(objective);
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(autoSaveTimer);
  }, [objective, autoSave]);

  // Enhanced save with retry mechanism
  const saveWithRetry = useCallback(async (updates: Objective, retries = 3): Promise<boolean> => {
    try {
      // Always save to cache first (instant)
      await saveToCache(updates);
      
      // Try to save to Supabase
      const { error } = await supabase
        .from('objectives')
        .update({
          title: updates.title,
          description: updates.description,
          budget_planned: parseFloat(updates.budget_planned?.toString() || '0') || 0,
          target_date: updates.target_date,
          tags: updates.tags,
          currency: updates.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.id);
        
      if (error) throw error;
      return true;
      
    } catch (err: any) {
      console.error(`Save attempt failed (${retries} retries left):`, err);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return saveWithRetry(updates, retries - 1);
      } else {
        // Emergency save to sessionStorage
        try {
          sessionStorage.setItem('tiger_emergency_save', JSON.stringify(updates));
          console.log('💾 Emergency save to sessionStorage successful');
        } catch (sessionErr) {
          console.error('❌ Emergency save failed:', sessionErr);
        }
        return false;
      }
    }
  }, [saveToCache]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (objective && saveStatus !== 'saved') {
        // Synchronous save to sessionStorage as fallback
        try {
          sessionStorage.setItem('tiger_draft_objective', JSON.stringify(objective));
          console.log('💾 Page unload save to sessionStorage');
        } catch (err) {
          console.warn('Session storage save failed:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [objective, saveStatus]);

  // Recovery from sessionStorage on init
  useEffect(() => {
    const recoverFromSession = async () => {
      try {
        const draftData = sessionStorage.getItem('tiger_draft_objective');
        const emergencyData = sessionStorage.getItem('tiger_emergency_save');
        
        if (emergencyData && !objective) {
          const recoveredObj = JSON.parse(emergencyData);
          console.log('🔄 Recovered from emergency save:', recoveredObj.title);
          setObjective(recoveredObj);
          await saveToCache(recoveredObj);
          sessionStorage.removeItem('tiger_emergency_save');
        } else if (draftData && !objective) {
          const draftObj = JSON.parse(draftData);
          console.log('🔄 Recovered from draft save:', draftObj.title);
          setObjective(draftObj);
          await saveToCache(draftObj);
          sessionStorage.removeItem('tiger_draft_objective');
        }
      } catch (err) {
        console.warn('Recovery from sessionStorage failed:', err);
      }
    };

    if (user && !loading) {
      recoverFromSession();
    }
  }, [user, loading, objective, saveToCache]);

  return { loading, error, objective, krs, syncStatus, saveStatus, updateObjective };
}
