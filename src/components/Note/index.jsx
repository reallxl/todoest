import { useEffect, useRef, useState } from 'react';

import { getTimeString } from '@/utils/helpers';

import ActionButtonColumn from './ActionButtonColumn';
import Content from './Content';

const Note = ({
  dataKey,
  className,
  title,
  description,
  timestamp,
  onClick,
  // onDragStart,
  // onDragEnd,
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
  // const [isDragging, setIsDragging] = useState();

  // const [defaultPosStyle, setDefaultPosStyle] = useState({});
  const [style, setStyle] = useState({});
  // const [selectedStyle, setSelectedStyle] = useState({});

  const [isEditing, setIsEditing] = useState();

  useEffect(() => {
    setIsConfirming(false);
    setIsConfirmingDelete(false);
  }, [status]);

  useEffect(() => {
    if (!isEditing) return;
    descriptionRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    if (selected) return;
    setIsEditing(false);
  }, [selected]);

  useEffect(() => {
    const handleMeidaQueryChange = ({ matches }) => {
      setIsDesktop(matches);

      // const { current: noteEl } = ref;
      // const { top, left, width } = noteEl.getBoundingClientRect();
      // setDefaultPosStyle(
      //   matches
      //     ? {
      //         position: 'absolute',
      //         top: `${top}px`,
      //         left: `${left}px`,
      //         width: `${width}px`,
      //       }
      //     : {}
      // );
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
    // setIsDragging(true);
    // onDragStart?.(e);
  };

  // const handleDragEnd = useCallback(
  //   (e) => {
  //     if (e.type.includes('touch')) setStyle();

  //     let doHandleDragEnd;
  //     const { x: startX, y: startY } = grabStartPosRef.current;
  //     if (e.type.includes('touch')) {
  //       const { touches, changedTouches } = e.originalEvent ?? e;
  //       const touch = touches[0] ?? changedTouches[0];

  //       doHandleDragEnd =
  //         Math.abs(touch.pageX - startX) > 3 ||
  //         Math.abs(touch.pageY - startY) > 3;
  //     } else
  //       doHandleDragEnd =
  //         Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3;
  //     if (doHandleDragEnd) onDragEnd?.(e);

  //     setIsDragging(false);
  //     grabStartPosRef.current = null;
  //   },
  //   [onDragEnd]
  // );

  // useEffect(() => {
  //   const tryHandleDragEnd = (e) => {
  //     if (!isDragging) return;
  //     handleDragEnd(e);
  //   };

  //   document.addEventListener('mouseup', tryHandleDragEnd);
  //   document.addEventListener('touchend', tryHandleDragEnd);

  //   return () => {
  //     document.removeEventListener('mouseup', tryHandleDragEnd);
  //     document.removeEventListener('touchend', tryHandleDragEnd);
  //   };
  // }, [isDragging, handleDragEnd]);

  useEffect(() => setStyle(), [dataKey]);

  // useEffect(() => {
  //   const handleDragMove = (e) => {
  //     setIsClicking(false);
  //     if (!isDragging || !grabStartPosRef.current) return;

  //     const { x: startingTranslateX, y: startingTranslateY } =
  //       startingTranslateRef.current;
  //     const { x: startX, y: startY } = grabStartPosRef.current;

  //     if (e.type.includes('touch')) {
  //       const { touches, changedTouches } = e.originalEvent ?? e;
  //       const touch = touches[0] ?? changedTouches[0];

  //       setStyle((prevStyle) => ({
  //         ...prevStyle,
  //         transform: `translate(0, ${(startingTranslateY + touch.pageY - startY).toFixed(2)}px)`,
  //       }));
  //     } else
  //       setStyle((prevStyle) => ({
  //         ...prevStyle,
  //         transform: `translate(${(startingTranslateX + e.clientX - startX).toFixed(2)}px, ${(startingTranslateY + e.clientY - startY).toFixed(2)}px)`,
  //       }));
  //   };

  //   if (isDragging) {
  //     document.addEventListener('mousemove', handleDragMove);
  //     document.addEventListener('touchmove', handleDragMove);
  //   } else {
  //     document.removeEventListener('mousemove', handleDragMove);
  //     document.removeEventListener('touchmove', handleDragMove);
  //   }

  //   return () => {
  //     document.removeEventListener('mousemove', handleDragMove);
  //     document.removeEventListener('touchmove', handleDragMove);
  //   };
  // }, [isDragging]);

  useEffect(() => {
    // if (isDesktop) return;
    //   setSelectedStyle(
    //     selected
    //       ? {
    //           top: '50%',
    //           left: '50%',
    //           width: '75%',
    //           height: '75%',
    //           transform: 'translate(-50%, -50%)',
    //           zIndex: 100,
    //         }
    //       : {}
    //   );
    // else {
    if (selected) {
      [...document.querySelectorAll('div[data-note="true"]')]
        .filter((el) => el !== ref.current)
        .forEach((el) => {
          el.style.padding = 0;
          el.style.border = 0;
          el.style.opacity = 0;
          el.style.height = 0;
          el.style.marginTop = '-0.5rem';
          el.style.overflow = 'hidden';
        });
      // setSelectedStyle({
      //   height: '100%',
      // });
    } else {
      [...document.querySelectorAll('div[data-note="true"]')]
        .filter((el) => el !== ref.current)
        .forEach((el) => {
          el.style.padding = null;
          el.style.border = null;
          el.style.opacity = null;
          el.style.height = null;
          el.style.marginTop = null;
          el.style.overflow = null;
        });
      // setSelectedStyle({});
    }
    // }
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

  const doneButtonRef = useRef();
  const [isConfirming, setIsConfirming] = useState();

  const deleteButtonRef = useRef();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState();

  const handleClickOK = (e) => {
    e.stopPropagation();
    onEdit?.({
      title: titleRef.current.value,
      description: descriptionRef.current.value,
    });
    setIsEditing(false);
  };

  const handleClickCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) return;
    setIsConfirming(false);
    setIsConfirmingDelete(false);
  }, [isEditing]);

  const done = status?.includes?.('done');

  const handleClick = (e) => {
    const { current: el } = doneButtonRef ?? {};
    const { target } = e;
    if (el?.contains(target)) {
      if (isConfirming) {
        onDone(e);
      } else setIsConfirming(true);
    } else if (isConfirming) setIsConfirming(false);

    const { current: delEl } = deleteButtonRef ?? {};

    if (delEl?.contains(target)) {
      if (isConfirmingDelete) {
        onDelete(e);
      } else setIsConfirmingDelete(true);
    } else if (isConfirmingDelete) setIsConfirmingDelete(false);

    if (
      !isClicking ||
      isEditing ||
      isConfirming ||
      isConfirmingDelete ||
      el?.contains(target) ||
      delEl?.contains(target)
    )
      return;
    onClick?.(e);
  };

  const renderDoneMark = () => (
    <div
      className={`absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 rotate-[30deg] rounded-md border-2 border-green-500 bg-transparent ${selected ? 'p-4 text-2xl' : 'px-2 py-1'} font-bold text-green-500`}
    >
      DONE
    </div>
  );

  const renderTimestampString = () => (
    <span className="absolute bottom-2 right-6 text-xs text-slate-500">
      {`${timestamp !== dataKey ? 'Last edited ' : ''}${getTimeString(timestamp)}`}
    </span>
  );

  return (
    <div
      data-note
      data-key={dataKey}
      className={`${selected ? `p-6 pb-8 ${isDesktop ? 'left-1/2 top-1/2 z-10 h-[75vh] min-h-[75vh] w-[75vw] -translate-x-1/2 -translate-y-1/2' : 'size-full'}` : 'h-[6.5rem] w-full px-6 py-4 md:w-96'} relative flex cursor-grab select-none flex-col items-center justify-center gap-2 rounded-md border-2 border-black bg-yellow-200 text-black transition-all duration-300 ease-in ${done ? 'border-4 border-green-500 opacity-80' : ''} ${className ? `${className}` : ''}`}
      style={{
        // ...defaultPosStyle,
        ...style,
        // ...selectedStyle,
      }}
      ref={ref}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      // onMouseUp={handleDragEnd}
      // onTouchEnd={handleDragEnd}
      onClick={handleClick}
    >
      {done && renderDoneMark()}
      <div
        className={`${selected ? 'size-full gap-2' : 'w-full'} flex flex-col text-wrap break-words transition-all duration-100`}
      >
        <Content
          selected={selected}
          isEditing={isEditing}
          title={title}
          titleRef={titleRef}
          description={description}
          descriptionRef={descriptionRef}
        />
      </div>
      {selected && renderTimestampString()}
      <ActionButtonColumn
        selected={selected}
        isEditing={isEditing}
        status={status}
        onPin={onPin}
        onEdit={() => setIsEditing(true)}
        isConfirming={isConfirming}
        okProps={
          isEditing ? { onClick: handleClickOK } : { ref: doneButtonRef }
        }
        isConfirmingDelete={isConfirmingDelete}
        cancelProps={
          isEditing ? { onClick: handleClickCancel } : { ref: deleteButtonRef }
        }
      />
    </div>
  );
};

export default Note;
