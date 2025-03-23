// Core
import { useState } from 'react';

// Components
import ConfigurationHeader from '@/lib/ui/screen-components/protected/super-admin/configurations/view/header/screen-header';
import ConfigurationsMain from '@/lib/ui/screen-components/protected/super-admin/configurations/view/main';

// Interfaces and Types

import ConfigurationAddForm from '@/lib/ui/screen-components/protected/super-admin/configurations/add-form';
import { IConfiguration, IConfigurationResponse } from '@/lib/utils/interfaces';

export default function ConfigurationsScreen() {
  // State
  const [isAddConfigurationVisible, setIsAddConfigurationVisible] = useState(false);
  const [rider, setConfiguration] = useState<null | IConfiguration>(null);
  const [reload, setReaload] = useState<number>(0);

  return (
    <div className="screen-container">
      <ConfigurationHeader setIsAddConfigurationVisible={setIsAddConfigurationVisible} />

      <ConfigurationsMain
        setIsAddConfigurationVisible={setIsAddConfigurationVisible}
        setConfiguration={setConfiguration}
        reload={reload}
      />

      <ConfigurationAddForm
        configuration={rider}
        onHide={() => {
          setIsAddConfigurationVisible(false);
          setConfiguration(null);
        }}
        isAddConfigurationVisible={isAddConfigurationVisible}
        setReload={setReaload}
      />
    </div>
  );
}
