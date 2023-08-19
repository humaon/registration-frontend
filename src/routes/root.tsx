import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const BASE_URL = import.meta.env.VITE_API_URL;

interface IOption {
  label: string;
  value: string;
}

interface IInput {
  name: string;
  sectors: IOption[];
  agreedToTerms: boolean;
}

const options = [
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Construction materials', label: 'Construction materials' },
  { value: 'Electronics and Optics', label: 'Electronics and Optics' },
];

const getMatchedOptions = (values: string[]) => {
  const matchedOptions: IOption[] = [];
  for (const value of values) {
    const matched = options.find((option) => option.value.toLowerCase() === value.toLowerCase());
    if (matched) matchedOptions.push(matched);
  }
  return matchedOptions;
};

export default function Root() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [inputs, setInputs] = useState<IInput>({
    name: '',
    sectors: [],
    agreedToTerms: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = window.sessionStorage.getItem('token');
    if (!token) return;

    (async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/subscribe`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { name, sectors, agreedToTerms } = data.data;
        const selectedSectors = getMatchedOptions(sectors);
        setInputs({ name, sectors: selectedSectors, agreedToTerms });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('error:', err);
      }
      setIsLoading(false);
    })();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChange = (e: any) => {
    if (e.target.name === 'agreedToTerms') {
      setInputs((prevState) => ({ ...prevState, [e.target.name]: e.target.checked }));
      return;
    }
    setInputs((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (e: any) => {
    e.preventDefault();
    const token = window.sessionStorage.getItem('token');

    setIsSaving(true);
    try {
      if (token) {
        await axios.put(
          `${BASE_URL}/api/subscribe`,
          {
            ...inputs,
            sectors: inputs.sectors.map((sector) => sector.value),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const { data } = await axios.post(`${BASE_URL}/api/subscribe`, {
          ...inputs,
          sectors: inputs.sectors.map((sector) => sector.value),
        });
        window.sessionStorage.setItem('token', data.token);
      }
      navigate('/view');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('error:', err);
    }
    setIsSaving(false);
  };

  const isDisabled = !inputs.agreedToTerms || isSaving;

  if (isLoading) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <h3 className="block text-2xl text-md font-extrabold text-gray-700 mb-2">Loading...</h3>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
        <p className="mb-6">Please enter your name and select the sectors you are involved in.</p>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={inputs.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sectors" className="block text-sm font-medium text-gray-700 mb-2">
              Sectors:
            </label>
            <Select
              name="sectors"
              isMulti
              required
              closeMenuOnSelect={false}
              value={inputs.sectors}
              options={options}
              onChange={(values) => {
                setInputs((prevState) => ({
                  ...prevState,
                  sectors: values as IOption[],
                }));
              }}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                name="agreedToTerms"
                type="checkbox"
                checked={inputs.agreedToTerms}
                onChange={onChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Agree to terms</span>
            </label>
          </div>
          <button
            type="submit"
            className={`
              w-full
            bg-blue-500
            text-white
              py-2
              rounded-lg
            enabled:hover:bg-blue-600
              focus:ring
            focus:ring-blue-300
              disabled:opacity-50 ${isDisabled ? 'cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </main>
  );
}
