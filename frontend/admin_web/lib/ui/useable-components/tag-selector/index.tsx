import { IDropdownComponentProps } from '@/lib/utils/interfaces';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import InputSkeleton from '../custom-skeletons/inputfield.skeleton';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import TextIconClickable from '../text-icon-clickable';

const TagSelectorComponent = ({
  name,
  placeholder,
  options,
  selectedItems = [],
  setSelectedItems,
  showLabel,
  isLoading = false,
  filter = true,
  extraFooterButton,
  ...props
}: any) => {
  const itemTemplate = (option: { label: string }) => (
    <div className="align-items-center flex">
      <div>{option.label}</div>
    </div>
  );

  const panelFooterTemplate = () => (
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

  const handleRemoveItem = (itemToRemove: any) => {
    setSelectedItems(name, selectedItems.filter((item: any) => item !== itemToRemove.value));
  };

  return !isLoading ? (
    <div className="flex w-full flex-col justify-center gap-y-1">
      {showLabel && (
        <label htmlFor={name} className="text-sm font-[500]">
          {placeholder}
        </label>
      )}

      <Dropdown
        value={selectedItems}
        options={options}
        onChange={(e: DropdownChangeEvent) => setSelectedItems(name, e.value)}
        optionLabel="label"
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        className="md:w-20rem p-dropdown-no-box-shadow m-0 h-10 w-full border border-gray-300 p-0 align-middle text-sm focus:shadow-none focus:outline-none"
        panelClassName="border-gray-200 border-2"
        filter={filter}
        checkmark
        panelFooterTemplate={panelFooterTemplate}
        multiple
        {...props}
      />

      {selectedItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedItems.map((item: any) => (
            <span
              key={item}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center"
            >
              {item}
              <button
                type="button"
                className="ml-2 text-white"
                onClick={() => handleRemoveItem(item)}
              >
                &#10005;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  ) : (
    <InputSkeleton />
  );
};

export default TagSelectorComponent;
