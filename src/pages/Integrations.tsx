import SafeAreaContainer from "@/components/SafeAreaContainer";
import { ProjectIntegration } from "@/components/ProjectIntegration";

const Integrations = () => {
  return (
    <SafeAreaContainer>
      <div className="container mx-auto p-6">
        <ProjectIntegration />
      </div>
    </SafeAreaContainer>
  );
};

export default Integrations;