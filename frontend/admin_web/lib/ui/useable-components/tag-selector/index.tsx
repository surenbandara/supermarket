import { IDropdownComponentProps } from '@/lib/utils/interfaces';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import InputSkeleton from '../custom-skeletons/inputfield.skeleton';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import TextIconClickable from '../text-icon-clickable';

const TagSelectorComponent = ({
  name,
  placeholder,
  options,
  selectedItem,
  setSelectedItem,
  showLabel,
  isLoading = false,
  filter = true,
  extraFooterButton,
  ...props
}: IDropdownComponentProps) => {
  const itemTemplate = (option: { label: string }) => {
    return (
      <div className="align-items-center flex">
        <div>{option.label}</div>
      </div>
    );
  };

  const panelFooterTemplate = () => {
    return (
      <div className="flex justify-between space-x-2">
        {extraFooterButton?.title && (
          <TextIconClickable
            className="w-full h-fit rounded text-black"
            icon={faAdd}
            iconStyles={{ color: 'black' }}
            title={extraFooterButton.title}
            onClick={extraFooterButton.onChange}
          />
        )}
      </div>
    );
  };

  return !isLoading ? (
    <div className="flex w-full flex-col justify-center gap-y-1">
      {showLabel && (
        <label htmlFor={name} className="text-sm font-[500]">
          {placeholder}
        </label>
      )}

      <Dropdown
        value={selectedItem}
        options={options}
        onChange={(e: DropdownChangeEvent) => setSelectedItem(name, e.value)}
        optionLabel="label"
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        className="md:w-20rem p-dropdown-no-box-shadow m-0 h-10 w-full border border-gray-300 p-0 align-middle text-sm focus:shadow-none focus:outline-none"
        panelClassName="border-gray-200 border-2"
        filter={filter}
        checkmark={true}
        panelFooterTemplate={panelFooterTemplate}
        {...props}
      />

      {selectedItem && selectedItem.label && (
        <div className="mt-2 flex items-center gap-2">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
            {selectedItem.label}
            <button
              type="button"
              className="ml-2 text-white"
              onClick={() => {}}
            >
              &#10005;
            </button>
          </span>
        </div>
      )}
    </div>
  ) : (
    <InputSkeleton />
  );
};

export default TagSelectorComponent;
