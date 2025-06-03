'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { EXAMPLE_SEARCH_TERMS } from '@/utils/CONSTANTS';
import { SearchIcon } from './icons';

export default function SearchBox({
  showExampleSearchTerms,
}: {
  showExampleSearchTerms?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const isRecognizingRef = useRef(false); // <-- dùng ref để tránh render lại khi cập nhật

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
      return;
    }

    if (isRecognizingRef.current) {
      console.warn("Đang nhận diện giọng nói, vui lòng đợi...");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = '';
    recognition.interimResults = false;

    isRecognizingRef.current = true;
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Bạn đã nói:', transcript);
      setQuery(transcript);
      router.push(`/?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) => {
      console.error('Lỗi giọng nói:', event.error);
      alert(`Không thể nhận diện giọng nói: ${event.error}`);
      isRecognizingRef.current = false;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
    };
  };

  return (
    <>
      <form
        className='sticky left-0 right-0 top-1 z-10 flex flex-col items-center'
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/?q=${encodeURIComponent(query)}`);
        }}
      >
        <div className='relative'>
          <SearchIcon className='absolute top-[50%] ml-4 translate-y-[-50%] fill-white-400' />
          <input
            className='h-[5vmax] max-h-12 min-h-10 w-[max(calc(41vw+10rem),350px)] max-w-[95vw] rounded-xl border-2 border-dark-500 bg-dark-500 py-2 pl-10 pr-10 text-sm shadow-2xl shadow-[black] placeholder:text-white-400 placeholder:opacity-50 focus:border-accent focus:border-opacity-40 focus:outline-none md:max-lg:w-[max(calc(35vw+16rem),350px)]'
            type='text'
            placeholder='Search for images...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className="absolute right-2 top-[50%] translate-y-[-50%] text-white hover:text-accent"
            aria-label="Tìm kiếm bằng giọng nói"
          >
            🎤
          </button>
        </div>
      </form>

      {showExampleSearchTerms && (
        <div className='scrollbar-style m-auto mt-2 flex w-[max(calc(41vw+10rem),350px)] max-w-[95vw] gap-1 overflow-x-auto text-nowrap font-mono text-xs text-white-400 md:max-lg:w-[max(calc(35vw+16rem),350px)]'>
          <span>Select an image below for Similarity Search or </span>
          <span>try typing:</span>{' '}
          {EXAMPLE_SEARCH_TERMS.map((item, idx) => (
            <Link
              className='group'
              href={`/?q=${item}`}
              type='submit'
              key={item}
            >
              <span className='underline underline-offset-2 transition duration-200 group-hover:text-white-300'>
                {item}
              </span>
              {idx < EXAMPLE_SEARCH_TERMS.length - 1 && ','}
            </Link>
          ))}{' '}
        </div>
      )}
    </>
  );
}
