import { useContext } from 'react';
import {
  TiArrowSortedDown,
  TiArrowSortedUp,
  TiArrowUnsorted,
  TiPlus,
  TiRefreshOutline,
  TiZoomOutline,
} from 'react-icons/ti';

import { SORTING } from '@/constants';
import { AppContext } from '@/context/app';

const ActionButtonRow = ({ onSearch, onResetSearch, onAddNote, onSort }) => {
  const { keyword, sorting, selectedNote } = useContext(AppContext);

  return (
    <div
      className={`flex w-full items-center justify-center gap-4 transition-all duration-300 ${selectedNote ? 'h-0 overflow-hidden' : 'h-fit'}`}
    >
      <div
        className="cursor-pointer rounded-md border bg-white p-1 hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white"
        onClick={onSearch}
      >
        <TiZoomOutline className="size-6 fill-black" />
      </div>
      {!!keyword.length && (
        <div
          className="cursor-pointer rounded-md border bg-white p-1 hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white"
          onClick={onResetSearch}
        >
          <TiRefreshOutline className="size-6 fill-black" />
        </div>
      )}
      <div
        className={`w-fit cursor-pointer rounded-full border-white ${selectedNote ? 'h-0 overflow-hidden border-none' : 'h-fit border-4'} transition-all duration-300 hover:border-yellow-200 active:border-yellow-200`}
        onClick={onAddNote}
      >
        <div className="size-fit cursor-pointer rounded-full border-4 border-black bg-white p-2">
          <TiPlus className="size-6 fill-black" />
        </div>
      </div>
      <div
        className={`size-fit cursor-pointer rounded-md border bg-white p-1 ${!sorting ? 'opacity-50 hover:opacity-100 active:opacity-100' : 'hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white'}`}
        onClick={onSort}
      >
        {!sorting ? (
          <TiArrowUnsorted className="size-6 fill-black" />
        ) : sorting === SORTING.ASC ? (
          <TiArrowSortedUp className="size-6 fill-black" />
        ) : (
          <TiArrowSortedDown className="size-6 fill-black" />
        )}
      </div>
      {!!keyword.length && <div className="size-8"></div>}
    </div>
  );
};

export default ActionButtonRow;
