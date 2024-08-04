import { useEffect, useState } from 'react';
import Head from 'next/head';

import {
  LandingActionButton,
  ActionButtonRow,
  SearchModal,
  Board,
  Draft,
} from '@/components';
import { TOAST_TIMEOUT_MS } from '@/config';
import { ADD_NOTE_STATUS, SORTING } from '@/constants';
import { Provider } from '@/context/app';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState();
  const [isSearching, setIsSearching] = useState();
  const [keyword, setKeyword] = useState('');
  const [sorting, setSorting] = useState();

  useEffect(() => {
    const _notes = JSON.parse(localStorage.getItem('notes'));
    if (!_notes) return;

    setNotes(_notes);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () =>
      localStorage.setItem('notes', JSON.stringify(notes));

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [notes]);

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

  const handleSearch = (k) => {
    setKeyword(k);
    setIsSearching(false);
  };

  const renderSearchResultText = () => (
    <span className="self-start text-white">
      Notes containing &quot;
      <span className="font-bold">{keyword}</span>
      &quot; :{' '}
      {`${!sortedNotes.length ? 'no result found. Try something else.' : ''}`}
    </span>
  );

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

  const renderNoteAddedToast = () => (
    <div
      className={`absolute bottom-6 left-6 z-second w-[calc(100%-3rem)] rounded-md border-4 border-black bg-white p-4 text-black transition-all duration-300 ${addNoteStatus === ADD_NOTE_STATUS.JUST_ADDED ? 'opacity-100' : 'translate-y-full opacity-0'}`}
    >
      New item added !
    </div>
  );

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

  return (
    <>
      <Head>
        <title>todoest</title>
      </Head>
      <main className="relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden p-6 md:p-24">
        {notes.length ? (
          <Provider value={{ keyword, sorting, selectedNote, addNoteStatus }}>
            <ActionButtonRow
              onSearch={() => setIsSearching(true)}
              onResetSearch={() => setKeyword('')}
              onAddNote={handleAddNote}
              onSort={handleSort}
            />
            {!!isSearching && (
              <SearchModal
                onSearch={handleSearch}
                onClose={() => setIsSearching(false)}
              />
            )}
            {!!keyword.length && renderSearchResultText()}
            <Board
              notes={sortedNotes}
              onSelectNote={setSelectedNote}
              onUpdateNotes={setNotes}
            />
            <Draft
              open={addNoteStatus === ADD_NOTE_STATUS.ADDING}
              onOK={({ title, description }) => {
                setNotes([
                  ...notes,
                  { title, description, createdAt: Date.now() },
                ]);
                setAddNoteStatus(ADD_NOTE_STATUS.JUST_ADDED);
              }}
              onCancel={() => setAddNoteStatus(ADD_NOTE_STATUS.READY_TO_ADD)}
            />
            {renderNoteAddedToast()}
          </Provider>
        ) : (
          <LandingActionButton onAddNote={handleAddNote} />
        )}
      </main>
    </>
  );
};

export default Home;
