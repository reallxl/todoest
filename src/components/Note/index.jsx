import { useCallback, useEffect, useRef, useState } from 'react';
import { TiPen, TiPinOutline } from 'react-icons/ti';

const Note = ({
  dataKey,
  className,
  children,
  onClick,
  onDragStart,
  onDragEnd,
  onDelete,
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

  useEffect(() => {
    const noteEl = ref?.current;
    if (!noteEl) return;

    const handleMeidaQueryChange = ({ matches }) => {
      setIsDesktop(matches);
      console.log('change', matches);
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

      setIsDragging(false);
      grabStartPosRef.current = null;
      onDragEnd?.(e);
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

  return (
    <div
      data-note
      data-key={dataKey}
      className={`${selected ? 'h-full' : 'h-fit'} relative flex w-full rounded-md border-2 border-black duration-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab duration-500 ease-in-out'} h-[5.5rem] select-none items-center bg-yellow-200 p-2 text-black transition-all md:w-96 ${className ? `${className}` : ''}`}
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
      <p
        className={`${selected ? 'size-full' : 'line-clamp-3'} text-wrap break-words transition-all duration-100`}
      >
        {children}
      </p>
      <div className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white p-0.5">
        <TiPinOutline />
      </div>

      <TiPen />
      <button onClick={onDelete}>X</button>
    </div>
  );
};

export default Note;
