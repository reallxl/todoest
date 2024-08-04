import { useEffect, useRef } from 'react';
import { TiZoomOutline } from 'react-icons/ti';

const SearchModal = ({ onSearch, onClose }) => {
  const containerRef = useRef();
  const modalRef = useRef();
  const inputRef = useRef();

  useEffect(() => inputRef.current.focus(), []);

  useEffect(() => {
    const { current: containerEl } = containerRef;
    const { current: modalEl } = modalRef;

    const handleKeyDown = (e) => {
      const { key } = e;
      if (key !== 'Escape') return;

      onClose(e);
    };

    const handleClick = (e) => {
      const { target } = e;
      if (modalEl.contains(target)) return;

      onClose(e);
    };

    containerEl.addEventListener('keydown', handleKeyDown);
    containerEl.addEventListener('click', handleClick);
    return () => {
      containerEl.removeEventListener('keydown', handleKeyDown);
      containerEl.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  const handleSearch = () => onSearch(inputRef.current.value);

  const handleEnter = ({ key }) => {
    if (key !== 'Enter') return;
    handleSearch();
  };

  const handleKeyDown = ({ key }) => {
    if (key !== 'Enter' && key !== ' ') return;
    handleSearch();
  };

  return (
    <div
      className="fixed left-0 top-0 z-top h-screen w-screen"
      ref={containerRef}
    >
      <div className="size-full bg-black opacity-70"></div>
      <div
        className="absolute left-1/2 top-1/2 flex h-fit w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md bg-white p-4"
        ref={modalRef}
      >
        <input
          className="h-6 w-full border-b-2 border-b-black text-black focus-visible:outline-none"
          onKeyDown={handleEnter}
          ref={inputRef}
        ></input>
        <div
          className="cursor-pointer rounded-md border-2 border-white bg-white p-1 hover:border-black active:border-black"
          onClick={handleSearch}
          onKeyDown={handleKeyDown}
          tabIndex="0"
        >
          <TiZoomOutline className="size-6 fill-black" />
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
