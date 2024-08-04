import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  TiRefreshOutline,
  TiArrowUnsorted,
  TiPinOutline,
  TiPlus,
  // TiPlusOutline,
  TiZoomOutline,
  TiArrowSortedUp,
  TiArrowSortedDown,
} from 'react-icons/ti';

import { Draft, Note, SearchModal } from '@/components';
import { TOAST_TIMEOUT_MS } from '@/config';
import { ADD_NOTE_STATUS, SORTING } from '@/constants';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedNote, setSelectedNote] = useState();
  const currentLayerRef = useRef(0);

  useEffect(() => {
    const _notes = JSON.parse(localStorage.getItem('notes'));
    if (!_notes) return;

    setNotes(_notes);
  }, []);

  const [listContainerH, setListContainerH] = useState();
  useEffect(() => {
    if (!notes.length || listContainerH) return;
    const { current: listContanierEl } = listContainerRef;
    setListContainerH(listContanierEl.getBoundingClientRect().height);
  }, [notes, listContainerH]);

  useEffect(() => {
    const handleBeforeUnload = () =>
      localStorage.setItem('notes', JSON.stringify(notes));

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [notes]);

  const renderActionButtons = () =>
    notes?.length ? (
      <div
        className={`flex w-full items-center justify-center gap-4 transition-all duration-300 ${selectedNote ? 'h-0 overflow-hidden' : 'h-fit'}`}
      >
        <div
          className="cursor-pointer rounded-md border bg-white p-1 hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white"
          onClick={() => setIsSearching(true)}
        >
          <TiZoomOutline className="size-6 fill-black" />
        </div>
        {!!keyword.length && (
          <div
            className="cursor-pointer rounded-md border bg-white p-1 hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white"
            onClick={() => setKeyword('')}
          >
            <TiRefreshOutline className="size-6 fill-black" />
          </div>
        )}
        <div
          className={`w-fit cursor-pointer rounded-full border-white ${selectedNote ? 'h-0 overflow-hidden border-none' : 'h-fit border-4'} transition-all duration-300 hover:border-yellow-200 active:border-yellow-200`}
          onClick={handleAddNote}
        >
          <div className="size-fit cursor-pointer rounded-full border-4 border-black bg-white p-2">
            <TiPlus className="size-6 fill-black" />
          </div>
        </div>
        <div
          className={`size-fit cursor-pointer rounded-md border bg-white p-1 ${!sorting ? 'opacity-50 hover:opacity-100 active:opacity-100' : 'hover:border-white hover:bg-black active:border-white active:bg-black [&>svg]:hover:fill-white [&>svg]:active:fill-white'}`}
          onClick={handleSort}
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
    ) : (
      <div
        className="size-fit cursor-pointer rounded-full border-8 border-white hover:border-yellow-200 active:border-yellow-200"
        onClick={handleAddNote}
      >
        <div className="size-fit cursor-pointer rounded-full border-8 border-black bg-white p-2">
          <TiPlus className="size-12 fill-black" />
        </div>
      </div>
    );

  const handleDragStart = ({ target }) => {
    const noteEl = target.closest('div');
    const { zIndex } = getComputedStyle(noteEl);
    if (+zIndex === currentLayerRef.current) return;

    // noteEl.style.zIndex = ++currentLayerRef.current;
  };

  const handleDragEnd = (e) => {
    const { type, target } = e;
    if (!type.includes('touch')) return;

    const { touches, changedTouches } = e.originalEvent ?? e;
    const { pageX, pageY } = touches[0] ?? changedTouches[0];

    const { top: lastNoteElTop, bottom: lastNoteElBottom } = document
      .querySelector('div[data-note="true"]:last-of-type')
      .getBoundingClientRect();

    const currentNoteEl = target.closest('div');
    const {
      dataset: { key: currentKey },
    } = currentNoteEl;

    if (pageY >= (lastNoteElTop + lastNoteElBottom) / 2) {
      setNotes((prevNotes) => {
        const _notes = prevNotes.slice();
        _notes.splice(
          _notes.findIndex(({ createdAt }) => createdAt === +currentKey),
          1
        );
        _notes.push(
          prevNotes.find(({ createdAt }) => createdAt === +currentKey)
        );
        return _notes;
      });
    } else {
      [...document.elementsFromPoint(pageX, pageY)]
        .filter((el) => el.dataset?.note && el !== currentNoteEl)
        .map((el) => {
          const {
            dataset: { key },
          } = el;
          const { top: myTop } = currentNoteEl.getBoundingClientRect();
          const { top, bottom } = el.getBoundingClientRect();

          setNotes((prevNotes) => {
            const _notes = prevNotes.slice();

            _notes.splice(
              _notes.findIndex(({ createdAt }) => createdAt === +currentKey),
              1
            );
            _notes.splice(
              _notes.findIndex(({ createdAt }) => createdAt === +key) +
                +!!(myTop >= (top + bottom) / 2),
              0,
              prevNotes.find(({ createdAt }) => createdAt === +currentKey)
            );

            return _notes;
          });
        });
    }
  };

  const [addNoteStatus, setAddNoteStatus] = useState(
    ADD_NOTE_STATUS.READY_TO_ADD
  );

  useEffect(() => {
    if (addNoteStatus !== ADD_NOTE_STATUS.JUST_ADDED) return;

    const id = setTimeout(
      () => setAddNoteStatus(ADD_NOTE_STATUS.READY_TO_ADD),
      TOAST_TIMEOUT_MS
    );
    return () => clearTimeout(id);
  }, [addNoteStatus]);

  const handleAddNote = () => setAddNoteStatus(ADD_NOTE_STATUS.ADDING);

  const [listOffset, setListOffset] = useState(0);
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

  const [isSearching, setIsSearching] = useState();

  const handleSearch = (k) => {
    setKeyword(k);
    setIsSearching(false);
  };

  const pinnedNotes =
    notes.filter(({ status }) => status?.includes('pinned')) ?? [];
  const doneNotes =
    notes.filter(
      (note) => note.status?.includes('done') && !pinnedNotes.includes(note)
    ) ?? [];
  const restNotes =
    notes.filter(
      (note) => !pinnedNotes.includes(note) && !doneNotes.includes(note)
    ) ?? [];

  let sortedNotes = [...pinnedNotes, ...restNotes, ...doneNotes];
  if (keyword.length)
    sortedNotes = sortedNotes.filter(({ title, description }) => {
      const regex = new RegExp(keyword, 'i');
      return regex.test(title) || regex.test(description);
    });

  const [sorting, setSorting] = useState();

  const handleSort = () => {
    const sort = sorting === SORTING.ASC ? SORTING.DESC : SORTING.ASC;

    const sorter =
      sort === SORTING.ASC
        ? ({ createdAt: tsA }, { createdAt: tsB }) => tsA - tsB
        : ({ createdAt: tsA }, { createdAt: tsB }) => tsB - tsA;

    setNotes([
      ...pinnedNotes.toSorted(sorter),
      ...restNotes.toSorted(sorter),
      ...doneNotes.toSorted(sorter),
    ]);
    setSorting(sort);
  };

  const getHandleEdit =
    ({ createdAt }) =>
    ({ title, description }) =>
      setNotes((prevNotes) => {
        const _notes = prevNotes.slice();
        const note = _notes.find(({ createdAt: ts }) => ts === createdAt);
        note.title = title;
        note.description = description;
        note.updatedAt = Date.now();
        return _notes;
      });

  return (
    <>
      <Head>
        <title>todoest</title>
      </Head>
      <main className="relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden p-6 md:p-24">
        {renderActionButtons()}
        {!!isSearching && (
          <SearchModal
            onSearch={handleSearch}
            onClose={() => setIsSearching(false)}
          />
        )}
        {!!keyword.length && (
          <span className="self-start text-white">
            Notes containing &quot;
            <span className="font-bold">{keyword}</span>
            &quot; :{' '}
            {`${!sortedNotes.length ? 'no result found. Try something else.' : ''}`}
          </span>
        )}
        <div className="relative h-px w-full grow">
          {addNoteStatus === ADD_NOTE_STATUS.READY_TO_ADD &&
            !selectedNote &&
            listContainerH &&
            sortedNotes.map(({ status }, index) => {
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
            })}
          <div
            className={`relative size-full ${selectedNote ? '' : 'overflow-x-hidden overflow-y-scroll'}`}
            ref={listContainerRef}
          >
            <div
              className={`flex ${selectedNote ? 'h-full' : 'h-fit'} w-full flex-col gap-2`}
            >
              {sortedNotes.map((note) => {
                const { title, description, createdAt, updatedAt, status } =
                  note;
                const isSelected = selectedNote === note;

                return (
                  <Note
                    key={createdAt}
                    dataKey={createdAt}
                    title={title}
                    description={description}
                    timestamp={updatedAt ?? createdAt}
                    onClick={() =>
                      setSelectedNote((prevSelectedNote) =>
                        prevSelectedNote === note ? undefined : note
                      )
                    }
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onPin={() => {
                      const _notes = notes.slice();
                      const note = _notes.find(
                        ({ createdAt: ts }) => ts === createdAt
                      );
                      const { status } = note;
                      if (status?.includes('pinned'))
                        note.status = note.status.filter((s) => s !== 'pinned');
                      else note.status = (status ?? []).concat('pinned');

                      setNotes(_notes);
                    }}
                    onEdit={getHandleEdit(note)}
                    onDone={() => {
                      const _notes = notes.slice();
                      const note = _notes.find(
                        ({ createdAt: ts }) => ts === createdAt
                      );
                      note.status = (note.status ?? []).concat('done');
                      setNotes(_notes);
                    }}
                    onDelete={() => {
                      setSelectedNote();
                      setNotes(notes.filter((n) => n !== note));
                    }}
                    status={status ?? []}
                    selected={isSelected}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <Draft
          open={addNoteStatus === ADD_NOTE_STATUS.ADDING}
          onOK={({ title, description }) => {
            setNotes([...notes, { title, description, createdAt: Date.now() }]);
            setAddNoteStatus(ADD_NOTE_STATUS.JUST_ADDED);
          }}
          onCancel={() => setAddNoteStatus(ADD_NOTE_STATUS.READY_TO_ADD)}
        />
        <div
          className={`absolute bottom-6 left-6 z-second w-[calc(100%-3rem)] rounded-md border-4 border-black bg-white p-4 text-black transition-all duration-300 ${addNoteStatus === ADD_NOTE_STATUS.JUST_ADDED ? 'opacity-100' : 'translate-y-full opacity-0'}`}
        >
          New item added !
        </div>
      </main>
    </>
  );
};

export default Home;
