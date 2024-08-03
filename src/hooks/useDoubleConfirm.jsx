import { useEffect, useRef, useState } from 'react';

const useDoubleConfirm = (handler = () => {}, doSkipDoubleConfirm) => {
  const containerRef = useRef();
  const ref = useRef();

  const [isConfirming, setIsConfirming] = useState();

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const handleClick = (e) => {
      const { target } = e;
      const el = ref.current;

      if (el.contains(target)) {
        if (doSkipDoubleConfirm?.() || isConfirming) {
          handler(e);
        } else setIsConfirming(true);
      } else setIsConfirming(false);
    };

    containerEl.addEventListener('click', handleClick);
    return () => containerEl.removeEventListener('click', handleClick);
  }, [handler, doSkipDoubleConfirm, isConfirming]);

  return {
    isConfirming,
    setContainerRef: (ref) => {
      containerRef.current = ref;
    },
    ref,
  };
};

export default useDoubleConfirm;
