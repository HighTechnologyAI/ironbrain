import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/neon/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plane } from 'lucide-react';

const droneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serial: z.string().min(1, 'Serial number is required'),
  model: z.string().optional(),
  firmware: z.string().optional(),
  status: z.enum(['offline', 'online', 'armed', 'flying']).default('offline'),
});

type DroneFormData = z.infer<typeof droneSchema>;

interface CreateDroneFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateDroneForm: React.FC<CreateDroneFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<DroneFormData>({
    resolver: zodResolver(droneSchema),
    defaultValues: {
      name: '',
      serial: '',
      model: '',
      firmware: '',
      status: 'offline',
    },
  });

  const createDroneMutation = useMutation({
    mutationFn: async (data: DroneFormData) => {
      const { data: result, error } = await supabase
        .from('uav_drones')
        .insert({
          name: data.name,
          serial: data.serial,
          model: data.model || null,
          firmware: data.firmware || null,
          status: data.status,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uav-drones'] });
      toast.success(t('ops.fleet.created', 'Drone created successfully'));
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating drone:', error);
      toast.error(t('common.error', 'An error occurred'));
    },
  });

  const onSubmit = (data: DroneFormData) => {
    createDroneMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          {t('ops.fleet.createDrone', 'Create New Drone')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ops.fleet.name', 'Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Eagle-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ops.fleet.serial', 'Serial Number')}</FormLabel>
                  <FormControl>
                    <Input placeholder="DRN-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ops.fleet.model', 'Model')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Quadcopter X4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firmware"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ops.fleet.firmware', 'Firmware Version')}</FormLabel>
                  <FormControl>
                    <Input placeholder="v2.1.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ops.fleet.status', 'Status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="armed">Armed</SelectItem>
                      <SelectItem value="flying">Flying</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="neon"
                className="flex-1"
                disabled={createDroneMutation.isPending}
              >
                {createDroneMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="neon-outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};