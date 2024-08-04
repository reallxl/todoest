import { useContext, useEffect, useRef, useState } from 'react';
import { TiPinOutline } from 'react-icons/ti';

import { Note } from '@/components';
import { ADD_NOTE_STATUS } from '@/constants';
import { AppContext } from '@/context/app';

const Board = ({ notes, onSelectNote, onUpdateNotes }) => {
  const { selectedNote, addNoteStatus } = useContext(AppContext);

  const [listOffset, setListOffset] = useState(0);
  const [listContainerH, setListContainerH] = useState();
  useEffect(() => {
    if (!notes.length || listContainerH) return;
    const { current: listContanierEl } = listContainerRef;
    setListContainerH(listContanierEl.getBoundingClientRect().height);
  }, [notes, listContainerH]);

  const listContainerRef = useRef();

  useEffect(() => {
    const { current: listContanierEl } = listContainerRef ?? {};
    if (!listContanierEl) return;

    const handleScroll = () => {
      const { top } = listContanierEl.getBoundingClientRect();
      const { top: ListTop } = listContanierEl
        .querySelector('div')
        .getBoundingClientRect();

      setListOffset(ListTop - top);
    };

    listContanierEl.addEventListener('scroll', handleScroll);
    return () => listContanierEl.removeEventListener('scroll', handleScroll);
  }, []);

  // const currentLayerRef = useRef(0);

  // const handleDragStart = ({ target }) => {
  //   const noteEl = target.closest('div');
  //   const { zIndex } = getComputedStyle(noteEl);
  //   if (+zIndex === currentLayerRef.current) return;

  //   // noteEl.style.zIndex = ++currentLayerRef.current;
  // };

  // const handleDragEnd = (e) => {
  //   const { type, target } = e;
  //   if (!type.includes('touch')) return;

  //   const { touches, changedTouches } = e.originalEvent ?? e;
  //   const { pageX, pageY } = touches[0] ?? changedTouches[0];

  //   const { top: lastNoteElTop, bottom: lastNoteElBottom } = document
  //     .querySelector('div[data-note="true"]:last-of-type')
  //     .getBoundingClientRect();

  //   const currentNoteEl = target.closest('div');
  //   const {
  //     dataset: { key: currentKey },
  //   } = currentNoteEl;

  //   if (pageY >= (lastNoteElTop + lastNoteElBottom) / 2) {
  //     onUpdateNotes((prevNotes) => {
  //       const _notes = prevNotes.slice();
  //       _notes.splice(
  //         _notes.findIndex(({ createdAt }) => createdAt === +currentKey),
  //         1
  //       );
  //       _notes.push(
  //         prevNotes.find(({ createdAt }) => createdAt === +currentKey)
  //       );
  //       return _notes;
  //     });
  //   } else {
  //     [...document.elementsFromPoint(pageX, pageY)]
  //       .filter((el) => el.dataset?.note && el !== currentNoteEl)
  //       .map((el) => {
  //         const {
  //           dataset: { key },
  //         } = el;
  //         const { top: myTop } = currentNoteEl.getBoundingClientRect();
  //         const { top, bottom } = el.getBoundingClientRect();

  //         onUpdateNotes((prevNotes) => {
  //           const _notes = prevNotes.slice();

  //           _notes.splice(
  //             _notes.findIndex(({ createdAt }) => createdAt === +currentKey),
  //             1
  //           );
  //           _notes.splice(
  //             _notes.findIndex(({ createdAt }) => createdAt === +key) +
  //               +!!(myTop >= (top + bottom) / 2),
  //             0,
  //             prevNotes.find(({ createdAt }) => createdAt === +currentKey)
  //           );

  //           return _notes;
  //         });
  //       });
  //   }
  // };

  const renderPins = () =>
    notes.map(({ status }, index) => {
      const isPinned = status?.includes('pinned');
      if (!isPinned) return;

      const posY = 7 * 16 * index - 12 + listOffset;

      return (
        <div
          key={index}
          className="absolute left-0 top-0 z-second rounded-full border-2 border-black bg-white p-0.5"
          style={{
            transform: `translate(-50%, ${posY}px)`,
            opacity:
              posY >= -12 && posY <= listContainerH - 12
                ? 1
                : posY < -24 || posY > listContainerH
                  ? 0
                  : posY < -12
                    ? (posY + 24) / 12
                    : 1 - (posY - listContainerH + 12) / 12,
          }}
        >
          <TiPinOutline className="fill-black" />
        </div>
      );
    });

  const getHandleEdit =
    ({ createdAt }) =>
    ({ title, description }) =>
      onUpdateNotes((prevNotes) => {
        const _notes = prevNotes.slice();
        const note = _notes.find(({ createdAt: ts }) => ts === createdAt);
        note.title = title;
        note.description = description;
        note.updatedAt = Date.now();
        return _notes;
      });

  return (
    <div className={`relative w-full ${notes.length ? 'h-px grow' : ''}`}>
      {addNoteStatus === ADD_NOTE_STATUS.READY_TO_ADD &&
        !selectedNote &&
        listContainerH &&
        renderPins()}
      <div
        className={`relative size-full ${selectedNote ? '' : 'overflow-x-hidden overflow-y-scroll'}`}
        ref={listContainerRef}
      >
        <div
          className={`flex ${selectedNote ? 'h-full' : 'h-fit'} w-full flex-col gap-2`}
        >
          {notes.map((note) => {
            const { title, description, createdAt, updatedAt, status } = note;
            const isSelected = selectedNote === note;

            return (
              <Note
                key={createdAt}
                dataKey={createdAt}
                title={title}
                description={description}
                timestamp={updatedAt ?? createdAt}
                onClick={() =>
                  onSelectNote((prevSelectedNote) =>
                    prevSelectedNote === note ? undefined : note
                  )
                }
                // onDragStart={handleDragStart}
                // onDragEnd={handleDragEnd}
                onPin={() => {
                  const _notes = notes.slice();
                  const note = _notes.find(
                    ({ createdAt: ts }) => ts === createdAt
                  );
                  const { status } = note;
                  if (status?.includes('pinned'))
                    note.status = note.status.filter((s) => s !== 'pinned');
                  else note.status = (status ?? []).concat('pinned');

                  onUpdateNotes(_notes);
                }}
                onEdit={getHandleEdit(note)}
                onDone={() => {
                  const _notes = notes.slice();
                  const note = _notes.find(
                    ({ createdAt: ts }) => ts === createdAt
                  );
                  note.status = (note.status ?? []).concat('done');
                  onUpdateNotes(_notes);
                }}
                onDelete={() => {
                  onSelectNote();
                  onUpdateNotes(notes.filter((n) => n !== note));
                }}
                status={status ?? []}
                selected={isSelected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
