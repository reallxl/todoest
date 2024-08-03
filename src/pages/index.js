import { Draft, Note, SearchModal } from '@/components';
import { MOCK_NOTES } from '@/data/mock';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import {
  TiRefreshOutline,
  TiArrowUnsorted,
  TiPinOutline,
  TiPlus,
  TiPlusOutline,
  TiZoomOutline,
  TiArrowSortedUp,
  TiArrowSortedDown,
} from 'react-icons/ti';

const Home = () => {
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [keyword, setKeyword] = useState('');
  const [selectedNote, setSelectedNote] = useState();
  const currentLayerRef = useRef(0);

  useEffect(
    () => setNotes(JSON.parse(localStorage.getItem('notes') ?? '[]')),
    []
  );

  useEffect(() => {
    const handleBeforeUnload = () =>
      localStorage.setItem('notes', JSON.stringify(notes));

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [notes]);

  const renderActionButtons = () => (
    <div
      className={`flex w-full items-center justify-center gap-4 transition-all duration-300 ${selectedNote ? 'h-0 overflow-hidden' : 'h-fit'}`}
    >
      <div
        className="cursor-pointer rounded-md bg-white p-1"
        onClick={() => setIsSearching(true)}
      >
        <TiZoomOutline className="size-6 fill-black" />
      </div>
      {!!keyword.length && (
        <div
          className="cursor-pointer rounded-md bg-white p-1"
          onClick={() => setKeyword('')}
        >
          <TiRefreshOutline className="size-6 fill-black" />
        </div>
      )}
      <div
        className={`w-fit cursor-pointer rounded-full border-white ${selectedNote ? 'h-0 overflow-hidden border-none' : 'h-fit border-4'} transition-all duration-300`}
        onClick={handleAddNote}
      >
        <div className="size-fit cursor-pointer rounded-full border-4 border-black bg-white p-2">
          <TiPlus className="size-6 fill-black" />
        </div>
      </div>
      <div
        className="size-fit rounded-md bg-white p-1 opacity-50 hover:opacity-100"
        onClick={handleSort}
      >
        {!currentSort ? (
          <TiArrowUnsorted className="size-6 fill-black" />
        ) : currentSort === 'asc' ? (
          <TiArrowSortedUp className="size-6 fill-black" />
        ) : (
          <TiArrowSortedDown className="size-6 fill-black" />
        )}
      </div>
      {!!keyword.length && <div className="size-8"></div>}
    </div>
  );

  const handleDragStart = ({ target }) => {
    const noteEl = target.closest('div');
    const { zIndex } = getComputedStyle(noteEl);
    if (+zIndex === currentLayerRef.current) return;

    noteEl.style.zIndex = ++currentLayerRef.current;
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
          _notes.findIndex(({ timestamp }) => timestamp === +currentKey),
          1
        );
        _notes.push(
          prevNotes.find(({ timestamp }) => timestamp === +currentKey)
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
              _notes.findIndex(({ timestamp }) => timestamp === +currentKey),
              1
            );
            _notes.splice(
              _notes.findIndex(({ timestamp }) => timestamp === +key) +
                +!!(myTop >= (top + bottom) / 2),
              0,
              prevNotes.find(({ timestamp }) => timestamp === +currentKey)
            );

            return _notes;
          });
        });
    }
  };

  const [isAdding, setIsAdding] = useState();
  const handleAddNote = () => {
    setIsAdding(true);
  };

  const [listContainerH, setListContainerH] = useState();
  const [listOffset, setListOffset] = useState(0);
  const listContainerRef = useRef();
  useEffect(() => {
    const { current: listContanierEl } = listContainerRef ?? {};
    if (!listContanierEl) return;

    setListContainerH(listContanierEl.getBoundingClientRect().height);

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

  const [currentSort, setCurrentSort] = useState();

  const handleSort = () => {
    const sorter =
      currentSort === 'desc'
        ? ({ timestamp: tsA }, { timestamp: tsB }) => tsB - tsA
        : ({ timestamp: tsA }, { timestamp: tsB }) => tsA - tsB;

    setNotes([
      ...pinnedNotes.toSorted(sorter),
      ...restNotes.toSorted(sorter),
      ...doneNotes.toSorted(sorter),
    ]);
    setCurrentSort((prevSort) => (prevSort === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <>
      <Head>
        <title>todoest</title>
      </Head>
      <main className="relative flex size-full flex-col items-center gap-4 overflow-hidden p-6 md:p-24">
        {renderActionButtons()}
        {!!isSearching && (
          <SearchModal
            onSearch={handleSearch}
            onClose={() => setIsSearching(false)}
          />
        )}
        <div className="relative h-px w-full grow">
          {!isAdding &&
            !selectedNote &&
            listContainerH &&
            sortedNotes.map(({ status }, index) => {
              const isPinned = status?.includes('pinned');
              if (!isPinned) return;

              const posY = 7 * 16 * index - 12 + listOffset;

              return (
                <div
                  key={index}
                  className="absolute left-0 top-0 z-[2147483646] rounded-full border-2 border-black bg-white p-0.5"
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
                const { title, description, timestamp, status } = note;
                const isSelected = selectedNote === note;

                return (
                  <Note
                    key={timestamp}
                    dataKey={timestamp}
                    title={title}
                    description={description}
                    timestamp={timestamp}
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
                        ({ timestamp: ts }) => ts === timestamp
                      );
                      const { status } = note;
                      if (status?.includes('pinned'))
                        note.status = note.status.filter((s) => s !== 'pinned');
                      else note.status = (status ?? []).concat('pinned');

                      setNotes(_notes);
                    }}
                    onEdit={({ title, description }) =>
                      setNotes((prevNotes) => {
                        const _notes = prevNotes.slice();
                        const note = _notes.find(
                          ({ timestamp: ts }) => ts === timestamp
                        );
                        note.title = title;
                        note.description = description;
                        return _notes;
                      })
                    }
                    onDone={() => {
                      const _notes = notes.slice();
                      const note = _notes.find(
                        ({ timestamp: ts }) => ts === timestamp
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
          open={isAdding}
          onOK={({ title, description }) => {
            setNotes([...notes, { title, description, timestamp: Date.now() }]);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      </main>
    </>
  );
};

export default Home;
