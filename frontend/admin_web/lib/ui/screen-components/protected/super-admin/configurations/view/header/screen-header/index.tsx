// Interface and Types


// Components
import HeaderText from '@/lib/ui/useable-components/header-text';
import TextIconClickable from '@/lib/ui/useable-components/text-icon-clickable';
import { IConfigurationHeaderProps } from '@/lib/utils/interfaces/configuration.interface';

// Icons
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

const ConfiigurationHeader = ({ setIsAddConfigurationVisible }: IConfigurationHeaderProps) => {
  // Hooks
  const t = useTranslations();
  return (
    <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white p-3 shadow-sm">
      <div className="flex w-full justify-between">
        <HeaderText className="heading" text={'Configurations'} />
        <TextIconClickable
          className="rounded border-gray-300 bg-black text-white sm:w-auto"
          icon={faAdd}
          iconStyles={{ color: 'white' }}
          title={'Add Configurations'}
          onClick={() => setIsAddConfigurationVisible(true)}
        />
      </div>
    </div>
  );
};

export default ConfiigurationHeader;
