import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function View() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    name: string;
    sectors: string[];
    agreedToTerms: boolean;
  } | null>(null);
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      return navigate('/');
    }

    (async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/subscribe`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.data === null) {
          setData(null);
        } else {
          setData({
            name: data.data.name,
            sectors: data.data.sectors,
            agreedToTerms: data.data.agreedToTerms,
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
      }
      setIsLoading(false);
    })();
  }, [navigate, token]);

  const goHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <h3 className="block text-2xl text-md font-extrabold text-gray-700 mb-2">Loading...</h3>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <h3 className="block text-2xl text-md font-extrabold text-gray-400 mb-2">No data found</h3>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-2">
      <div className="bg-white rounded shadow-md w-96">
        <div className="flex justify-center items-center p-20 bg-blue-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-16 h-16"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
        <div className="flex flex-col justify-center items-center gap-3 py-6 px-4 text-center">
          <h3 className="text-xl font-extrabold">{data.name}</h3>
          <p className="text-md">{data.sectors.join(', ')}</p>
          <div className="flex flex-col justify-center items-center text-center">
            <h3 className="text-sm font-semibold">Terms & Conditions</h3>
            <p className="text-sm">{data.agreedToTerms ? 'Yes' : 'No'}</p>
          </div>
        </div>
        <button onClick={goHome} className="bg-slate-100 w-full py-4">
          ←
        </button>
      </div>
    </main>
  );
}
