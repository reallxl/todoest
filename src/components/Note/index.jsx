import { getTimeString } from '@/utils/helpers';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TiTickOutline,
  TiTick,
  TiTimes,
  TiTimesOutline,
  TiPen,
  TiPin,
  TiPinOutline,
} from 'react-icons/ti';

const Note = ({
  dataKey,
  className,
  title,
  description,
  timestamp,
  onClick,
  onDragStart,
  onDragEnd,
  onPin,
  onEdit,
  onDone,
  onDelete,
  status,
  selected,
}) => {
  const ref = useRef();
  const startingTranslateRef = useRef();
  const grabStartPosRef = useRef();

  const [isDesktop, setIsDesktop] = useState();
  const [isClicking, setIsClicking] = useState();
  const [isDragging, setIsDragging] = useState();

  const [defaultPosStyle, setDefaultPosStyle] = useState({});
  const [style, setStyle] = useState({});
  const [selectedStyle, setSelectedStyle] = useState({});

  const [isEditing, setIsEditing] = useState();

  useEffect(() => {
    if (selected) return;
    setIsEditing(false);
  }, [selected]);

  useEffect(() => {
    const noteEl = ref?.current;
    if (!noteEl) return;

    const handleMeidaQueryChange = ({ matches }) => {
      setIsDesktop(matches);

      const { top, left, width } = noteEl.getBoundingClientRect();
      setDefaultPosStyle(
        matches
          ? {
              position: 'absolute',
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
            }
          : {}
      );
    };

    const mql = matchMedia('(min-width: 768px)');
    handleMeidaQueryChange(mql);

    mql.addEventListener('change', handleMeidaQueryChange);
    return () => mql.removeEventListener('change', handleMeidaQueryChange);
  }, []);

  const handleDragStart = (e) => {
    const [x, y] =
      ref.current.style?.transform?.match(/-?\d+(?:\.\d+)?/g) ?? [];
    startingTranslateRef.current = {
      x: parseFloat(x ?? 0),
      y: parseFloat(y ?? 0),
    };

    if (e.type.includes('touch')) {
      const { touches, changedTouches } = e.originalEvent ?? e;
      const touch = touches[0] ?? changedTouches[0];
      grabStartPosRef.current = {
        x: touch.pageX,
        y: touch.pageY,
      };
    } else
      grabStartPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

    setIsClicking(true);
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragEnd = useCallback(
    (e) => {
      if (e.type.includes('touch')) setStyle();

      let doHandleDragEnd;
      const { x: startX, y: startY } = grabStartPosRef.current;
      if (e.type.includes('touch')) {
        const { touches, changedTouches } = e.originalEvent ?? e;
        const touch = touches[0] ?? changedTouches[0];

        doHandleDragEnd =
          Math.abs(touch.pageX - startX) > 3 ||
          Math.abs(touch.pageY - startY) > 3;
      } else
        doHandleDragEnd =
          Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3;
      if (doHandleDragEnd) onDragEnd?.(e);

      setIsDragging(false);
      grabStartPosRef.current = null;
    },
    [onDragEnd]
  );

  useEffect(() => {
    const tryHandleDragEnd = (e) => {
      if (!isDragging) return;
      handleDragEnd(e);
    };

    document.addEventListener('mouseup', tryHandleDragEnd);
    document.addEventListener('touchend', tryHandleDragEnd);

    return () => {
      document.removeEventListener('mouseup', tryHandleDragEnd);
      document.removeEventListener('touchend', tryHandleDragEnd);
    };
  }, [isDragging, handleDragEnd]);

  useEffect(() => setStyle(), [dataKey]);

  useEffect(() => {
    const handleDragMove = (e) => {
      setIsClicking(false);
      if (!isDragging || !grabStartPosRef.current) return;

      const { x: startingTranslateX, y: startingTranslateY } =
        startingTranslateRef.current;
      const { x: startX, y: startY } = grabStartPosRef.current;

      if (e.type.includes('touch')) {
        const { touches, changedTouches } = e.originalEvent ?? e;
        const touch = touches[0] ?? changedTouches[0];

        setStyle((prevStyle) => ({
          ...prevStyle,
          transform: `translate(0, ${(startingTranslateY + touch.pageY - startY).toFixed(2)}px)`,
        }));
      } else
        setStyle((prevStyle) => ({
          ...prevStyle,
          transform: `translate(${(startingTranslateX + e.clientX - startX).toFixed(2)}px, ${(startingTranslateY + e.clientY - startY).toFixed(2)}px)`,
        }));
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove);
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isDesktop)
      setSelectedStyle(
        selected
          ? {
              top: '50%',
              left: '50%',
              width: '75%',
              height: '75%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
            }
          : {}
      );
    else {
      if (selected) {
        [...document.querySelectorAll('div[data-note="true"]')]
          .filter((el) => el !== ref.current)
          .forEach((el) => {
            el.style.padding = 0;
            el.style.border = 0;
            el.style.opacity = 0;
            el.style.height = 0;
            el.style.marginTop = '-0.5rem';
          });
        setSelectedStyle({
          height: '100%',
        });
      } else {
        [...document.querySelectorAll('div[data-note="true"]')]
          .filter((el) => el !== ref.current)
          .forEach((el) => {
            el.style.padding = null;
            el.style.border = null;
            el.style.opacity = null;
            el.style.height = null;
            el.style.marginTop = null;
          });
        setSelectedStyle({});
      }
    }
  }, [selected, isDesktop]);

  useEffect(() => {
    const noteEl = ref.current;

    return () =>
      [...document.querySelectorAll('div[data-note="true"]')]
        .filter((el) => el !== noteEl)
        .forEach((el) => {
          el.style.padding = null;
          el.style.border = null;
          el.style.opacity = null;
          el.style.height = null;
          el.style.marginTop = null;
        });
  }, []);

  const titleRef = useRef();
  const descriptionRef = useRef();

  const handleClickOK = (e) => {
    e.stopPropagation();

    if (isEditing) {
      onEdit?.({
        title: titleRef.current.value,
        description: descriptionRef.current.value,
      });
      setIsEditing(false);
    } else onDone?.();
  };

  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState();
  const deleteButtonRef = useRef();

  useEffect(() => {
    if (!isConfirmingDeletion) return;

    const noteEl = ref.current;
    const handleClick = ({ target }) => {
      if (deleteButtonRef?.current?.contains(target)) return;
      setIsConfirmingDeletion(false);
    };
    noteEl.addEventListener('click', handleClick);
    return () => noteEl.removeEventListener('click', handleClick);
  }, [isConfirmingDeletion]);

  const handleClickCancel = (e) => {
    console.log('click cancel', isConfirmingDeletion);
    e.stopPropagation();

    if (isEditing) setIsEditing(false);
    else if (isConfirmingDeletion) {
      setIsConfirmingDeletion(false);
      onDelete?.();
    } else setIsConfirmingDeletion(true);
  };

  const renderEditor = () => (
    <>
      <input
        className="h-6 w-full border-b-2 border-black bg-transparent px-2 py-1 font-bold focus:border-b-green-500 focus-visible:outline-none"
        placeholder="Enter Title..."
        defaultValue={title}
        onClick={(e) => e.stopPropagation()}
        ref={titleRef}
      />
      <textarea
        className="h-px w-full grow rounded-md border-2 border-black bg-transparent p-2 focus:border-green-500 focus-visible:outline-none"
        placeholder=""
        defaultValue={description}
        onClick={(e) => e.stopPropagation()}
        ref={descriptionRef}
      />
    </>
  );

  const renderContent = () => (
    <>
      {title && (
        <h3 className={`${selected ? '' : 'line-clamp-1'} w-full font-bold`}>
          {title}
        </h3>
      )}
      {description && (
        <p
          className={`${selected ? 'h-px grow overflow-y-scroll' : title ? 'line-clamp-2' : 'line-clamp-3'} w-full`}
        >
          {description}
        </p>
      )}
    </>
  );

  const pinned = status?.includes?.('pinned');
  const done = status?.includes?.('done');

  const renderActionButtons = () => (
    <div
      className={`absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 flex-col gap-2 transition-all ${selected ? 'duration-300' : 'opacity-0 duration-0'}`}
    >
      <div
        className={`cursor-pointer rounded-md border-2 ${pinned ? 'bg-slate-700' : 'bg-white hover:bg-slate-200'} border-black p-0.5 transition-opacity ${isEditing ? '-mt-8 opacity-0 duration-150' : 'duration-300'}`}
        onClick={(e) => {
          e.stopPropagation();
          onPin?.();
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
            className={`cursor-pointer rounded-md border-2 border-black bg-white p-0.5 transition-opacity ${isEditing ? '-mt-8 opacity-0 duration-150' : 'duration-300'} hover:bg-slate-200`}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <TiPen className="size-6" />
          </div>
          <div
            className={`cursor-pointer rounded-md border-2 border-green-500 bg-white p-0.5 ${selected ? '' : 'opacity-50 hover:opacity-100'} hover:bg-green-500 [&>svg]:hover:fill-white`}
            onClick={handleClickOK}
          >
            <TiTickOutline
              className={`${selected ? 'size-6' : 'size-4'} fill-green-500 stroke-green-500`}
            />
          </div>
        </>
      )}
      <div
        className={`cursor-pointer rounded-md border-2 p-0.5 ${isConfirmingDeletion ? 'border-white bg-red-500 [&>svg]:fill-white' : 'border-red-500 bg-white hover:bg-red-500 [&>svg]:hover:fill-white'}`}
        onClick={handleClickCancel}
        ref={deleteButtonRef}
      >
        <TiTimesOutline className="size-6 fill-red-500 stroke-red-500" />
      </div>
    </div>
  );

  const renderDoneMark = () => (
    <div
      className={`absolute left-1/2 top-1/2 z-10 origin-center -translate-x-1/2 -translate-y-1/2 rotate-[30deg] rounded-md border-2 border-green-500 bg-transparent ${selected ? 'p-4 text-2xl' : 'px-2 py-1'} font-bold text-green-500`}
    >
      DONE
    </div>
  );

  return (
    <div
      data-note
      data-key={dataKey}
      className={`${selected ? 'h-full p-6 pb-8' : 'h-[6.5rem] px-6 py-4'} relative flex w-full flex-col gap-2 rounded-md border-2 border-black ${isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab duration-300 ease-in'} select-none items-center justify-center bg-yellow-200 text-black transition-all ${done ? 'border-4 border-green-500 opacity-80' : ''} md:w-96 ${className ? `${className}` : ''}`}
      style={{
        ...defaultPosStyle,
        ...style,
        ...selectedStyle,
      }}
      ref={ref}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
      onClick={(e) => {
        if (!isClicking) return;
        onClick?.(e);
      }}
    >
      {done && renderDoneMark()}
      {/* {!selected && pinned && renderPin()} */}
      <div
        className={`${selected ? 'size-full gap-2' : 'w-full'} flex flex-col text-wrap break-words transition-all duration-100`}
      >
        {isEditing ? renderEditor() : renderContent()}
      </div>
      {selected && (
        <span className="absolute bottom-2 right-6 text-xs text-slate-500">
          {getTimeString(timestamp)}
        </span>
      )}
      {renderActionButtons()}
    </div>
  );
};

export default Note;
