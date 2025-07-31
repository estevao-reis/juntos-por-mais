'use client';

import { registerPartner } from '@/app/actions';
import { useRef } from 'react';

interface Leader {
  id: string;
  name: string;
}

interface RegistrationFormProps {
  leaders: Leader[];
}

export function RegistrationForm({ leaders }: RegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormAction = async (formData: FormData) => {
    const result = await registerPartner(formData);

    if (result.success) {
      alert(result.message);
      formRef.current?.reset();
    } else {
      alert(result.message);
  } };
  
  return (
    <form ref={formRef} action={handleFormAction} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      
      <div className="mb-6">
        <label htmlFor="leader" className="block text-gray-700 text-sm font-bold mb-2">
          Quem te indicou?
        </label>
        <select
          id="leader"
          name="leader"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          defaultValue=""
        >
          <option value="" disabled>Selecione um líder</option>
          {leaders.map((leader) => (
            <option key={leader.id} value={leader.id}>
              {leader.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Seu Nome Completo
        </label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
        />
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          Seu Melhor E-mail
        </label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
        />
      </div>

      <div className="flex items-center justify-center">
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full sm:w-auto">
          Cadastrar
        </button>
      </div>
    </form>
); }