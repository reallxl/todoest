import { Note } from '@/components';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

const Home = () => {
  const [notes, setNotes] = useState([
    {
      content:
        'MBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTIMBTI',
      timestamp: 1,
    },
    {
      content: 'NIHAO',
      timestamp: 2,
    },
    {
      content: 'DAJIAHAO',
      timestamp: 3,
    },
  ]);
  const [selectedNote, setSelectedNote] = useState();
  const currentLayerRef = useRef(0);

  useEffect(() => {
    return () =>
      localStorage.setItem('key', (+localStorage.getItem('key') ?? 0) + 1);
  }, []);

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

  return (
    <>
      <Head>
        <title>todoest</title>
      </Head>
      <main className={`flex size-full flex-col gap-2 p-4 md:p-24`}>
        {notes.map((note) => {
          const { content, timestamp } = note;

          return (
            <Note
              key={timestamp}
              dataKey={timestamp}
              onClick={() =>
                setSelectedNote((prevSelectedNote) =>
                  prevSelectedNote === note ? undefined : note
                )
              }
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDelete={() =>
                setNotes((prevNotes) => prevNotes.filter((n) => n !== note))
              }
              selected={selectedNote === note}
            >
              {content}
            </Note>
          );
        })}
      </main>
    </>
  );
};

export default Home;
