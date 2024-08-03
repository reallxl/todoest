import { useEffect, useRef } from 'react';
import { TiTickOutline, TiTimesOutline } from 'react-icons/ti';

import { useDoubleConfirm } from '@/hooks';

const Draft = ({ open, onOK, onCancel }) => {
  const titleRef = useRef();
  const descriptionRef = useRef();

  useEffect(() => {
    if (open) return;

    titleRef.current.value = '';
    descriptionRef.current.value = '';
  }, [open]);

  const {
    isConfirming,
    setContainerRef,
    ref: cancelButtonRef,
  } = useDoubleConfirm(onCancel, () => {
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    return !title && !description;
  });

  const handleClickOK = () => {
    const title = titleRef.current.value;
    const descriptionEl = descriptionRef.current;
    const { value: description } = descriptionEl;

    if (!title && !description) {
      descriptionEl.focus();
      return;
    }

    onOK?.({
      title,
      description,
    });
  };

  return (
    <div
      className={`absolute left-1/2 top-1/2 z-10 box-border flex size-[calc(100%-3rem)] ${open ? '-translate-y-1/2 opacity-100' : 'translate-y-[200%] opacity-0'} -translate-x-1/2 select-none items-center gap-2 rounded-md border-2 border-black bg-yellow-200 p-6 text-black transition-all duration-300 md:w-96`}
      ref={setContainerRef}
    >
      <div className="flex size-full w-px grow flex-col gap-2 text-wrap break-words transition-all duration-100">
        <input
          className="h-6 w-full border-b-2 border-black bg-transparent px-2 py-1 font-bold focus:border-b-green-500 focus-visible:outline-none"
          placeholder="Enter Title..."
          ref={titleRef}
        />
        <textarea
          className="h-px w-full grow rounded-md border-2 border-black bg-transparent p-2 focus:border-green-500 focus-visible:outline-none"
          placeholder="What to do..."
          ref={descriptionRef}
        />
      </div>
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 flex-col gap-2 transition-all duration-300">
        <div
          className="cursor-pointer rounded-md border-2 border-green-500 bg-white p-0.5 hover:bg-green-500 [&>svg]:hover:fill-white"
          onClick={handleClickOK}
        >
          <TiTickOutline className="size-6 fill-green-500 stroke-green-500" />
        </div>

        <div
          className={`cursor-pointer rounded-md border-2 p-0.5 ${isConfirming ? 'border-white bg-red-500 [&>svg]:fill-white' : 'border-red-500 bg-white hover:bg-red-500 [&>svg]:hover:fill-white'}`}
          ref={cancelButtonRef}
        >
          <TiTimesOutline className="size-6 fill-red-500 stroke-red-500" />
        </div>
      </div>
    </div>
  );
};

export default Draft;
