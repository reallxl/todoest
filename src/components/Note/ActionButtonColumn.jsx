import {
  TiPen,
  TiPin,
  TiPinOutline,
  TiTickOutline,
  TiTimesOutline,
} from 'react-icons/ti';

const ActionButtonColumn = ({
  selected,
  isEditing,
  status,
  onPin,
  onEdit,
  isConfirming,
  okProps,
  isConfirmingDelete,
  cancelProps,
}) => {
  const pinned = status?.includes?.('pinned');
  const done = status?.includes?.('done');

  return (
    <div
      className={`absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 flex-col gap-2 transition-all ${selected ? 'duration-300' : 'opacity-0 duration-0'}`}
    >
      <div
        className={`cursor-pointer rounded-md border-2 ${pinned ? 'border-white bg-black' : 'border-black bg-white hover:border-white hover:bg-black active:border-white active:bg-black [&_svg]:hover:fill-white [&_svg]:active:fill-white'} p-0.5 transition-opacity ${isEditing ? 'opacity-0' : ''} duration-300`}
        onClick={(e) => {
          e.stopPropagation();
          onPin();
        }}
      >
        {pinned ? (
          <TiPin className="size-6 fill-white" />
        ) : (
          <TiPinOutline className="size-6 fill-black" />
        )}
      </div>
      {!done && (
        <>
          <div
            className={`cursor-pointer rounded-md border-2 border-black bg-white p-0.5 transition-opacity ${isEditing ? 'opacity-0' : ''} border-black bg-white duration-300 hover:border-white hover:bg-black active:border-white active:bg-black [&_svg]:hover:fill-white [&_svg]:active:fill-white`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <TiPen className="size-6" />
          </div>
          <div className="relative size-fit">
            <div
              className={`cursor-pointer rounded-md border-2 border-green-500 bg-white p-0.5 ${selected ? '' : 'opacity-50 hover:opacity-100'} ${isConfirming ? 'border-white bg-green-500 [&>svg]:fill-white' : 'border-green-500 bg-white hover:bg-green-500 active:bg-green-500 [&>svg]:hover:fill-white [&>svg]:active:fill-white'}`}
              {...okProps}
            >
              <TiTickOutline
                className={`${selected ? 'size-6' : 'size-4'} z-0 fill-green-500 stroke-green-500`}
              />
            </div>
            <div
              className={`absolute left-0 top-1/2 -z-10 w-max -translate-y-1/2 rounded-s-md border-2 border-black bg-white pe-6 ps-2 text-sm text-black transition-all duration-300 ${isConfirming ? 'translate-x-[calc(-100%+1rem)] opacity-100' : '-translate-x-2/3 opacity-0'}`}
            >
              All set?
            </div>
          </div>
        </>
      )}
      <div className="relative size-fit">
        <div
          className={`relative cursor-pointer rounded-md border-2 p-0.5 ${isConfirmingDelete ? 'border-white bg-red-500 [&>svg]:fill-white' : 'border-red-500 bg-white hover:bg-red-500 active:bg-red-500 [&>svg]:hover:fill-white [&>svg]:active:fill-white'}`}
          {...cancelProps}
        >
          <TiTimesOutline className="size-6 fill-red-500 stroke-red-500" />
        </div>
        <div
          className={`absolute left-0 top-1/2 -z-10 w-max -translate-y-1/2 rounded-s-md border-2 border-black bg-white pe-6 ps-2 text-sm text-black transition-all duration-300 ${isConfirmingDelete ? 'translate-x-[calc(-100%+1rem)] opacity-100' : '-translate-x-2/3 opacity-0'}`}
        >
          Sure to abandon...?
        </div>
      </div>
    </div>
  );
};

export default ActionButtonColumn;
