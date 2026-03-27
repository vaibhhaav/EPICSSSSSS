import React, { useMemo, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase.js';

const interestOptions = ['music', 'art', 'stories', 'games', 'nature', 'reading'];
const personalityOptions = ['introvert', 'ambivert', 'extrovert'];
const communicationOptions = ['verbal', 'non-verbal', 'mixed'];
const emotionalStateOptions = ['calm', 'anxious', 'sad', 'happy', 'neutral', 'irritated'];
const attachmentOptions = ['secure', 'avoidant', 'ambivalent', 'disorganized', 'anxious'];
const availabilityOptions = ['morning', 'afternoon', 'evening'];
const traumaLevelOptions = ['none', 'mild', 'moderate', 'severe'];
const languageOptions = ['english', 'hindi', 'regional'];
<<<<<<< HEAD
const genderOptions = ['male', 'female', 'other'];
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
const patienceLevelOptions = ['low', 'medium', 'high'];
const healthConditionOptions = ['good', 'moderate', 'critical'];

const initialForm = {
  name: '',
  age: '',
<<<<<<< HEAD
  gender: '',
  personalityType: '',
  emotionalState: '',
  attachmentStyle: '',
  hobbies: [],
=======
  personalityType: '',
  emotionalState: '',
  attachmentStyle: '',
  interests: [],
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
  communicationStyle: '',
  availability: '',
  traumaLevel: '',
  language: '',
  patienceLevel: '',
  healthCondition: '',
};

export default function ProfileForm({ open, type, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [hobbyDropdownOpen, setHobbyDropdownOpen] = useState(false);
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d

  const isElder = type === 'elder';
  const title = useMemo(() => (isElder ? 'Add Elder Profile' : 'Add Orphan Profile'), [isElder]);

  if (!open) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  const toggleHobby = (hobby) => {
    setForm((prev) => {
      const alreadySelected = prev.hobbies.includes(hobby);
      return {
        ...prev,
        hobbies: alreadySelected
          ? prev.hobbies.filter((item) => item !== hobby)
          : [...prev.hobbies, hobby],
      };
    });
=======
  const updateInterests = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setForm((prev) => ({ ...prev, interests: values }));
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const required = [
      'name',
      'age',
<<<<<<< HEAD
      'gender',
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      'personalityType',
      'emotionalState',
      'attachmentStyle',
      'communicationStyle',
      'availability',
<<<<<<< HEAD
      'language',
    ];

    if (isElder) {
      required.push('patienceLevel', 'healthCondition');
    } else {
      required.push('traumaLevel');
    }

    const missing = required.some((key) => !String(form[key]).trim());
    if (missing || form.hobbies.length === 0) {
=======
      'traumaLevel',
      'language',
    ];

    if (isElder) required.push('patienceLevel', 'healthCondition');

    const missing = required.some((key) => !String(form[key]).trim());
    if (missing || form.interests.length === 0) {
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      setError('Please complete all fields.');
      alert('Please complete all required fields');
      return;
    }

<<<<<<< HEAD
    const normalizedHobbies = Array.isArray(form.hobbies)
      ? form.hobbies
      : String(form.hobbies)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
    const selectedHobbies = [...new Set(normalizedHobbies)].filter((item) =>
      interestOptions.includes(item),
    );

    const formData = {
      ...form,
      type,
      institutionType: type,
      name: String(form.name).trim(),
      gender: String(form.gender).trim(),
      personalityType: String(form.personalityType).trim(),
      emotionalState: String(form.emotionalState).trim(),
      attachmentStyle: String(form.attachmentStyle).trim(),
      hobbies: selectedHobbies,
      communicationStyle: String(form.communicationStyle).trim(),
      availability: String(form.availability).trim(),
      language: String(form.language).trim(),
      traumaLevel: isElder ? '' : String(form.traumaLevel).trim(),
=======
    const normalizedInterests = Array.isArray(form.interests)
      ? form.interests
      : String(form.interests)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const formData = {
      ...form,
      institutionType: type,
      name: String(form.name).trim(),
      personalityType: String(form.personalityType).trim(),
      emotionalState: String(form.emotionalState).trim(),
      attachmentStyle: String(form.attachmentStyle).trim(),
      interests: normalizedInterests,
      communicationStyle: String(form.communicationStyle).trim(),
      availability: String(form.availability).trim(),
      language: String(form.language).trim(),
      traumaLevel: String(form.traumaLevel).trim(),
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      healthCondition: String(form.healthCondition || '').trim(),
      age: Number(form.age),
    };

    if (isElder) {
      formData.patienceLevel = String(form.patienceLevel).trim();
<<<<<<< HEAD
    } else {
      formData.patienceLevel = '';
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
    }

    console.log('Submitting:', formData);

    try {
<<<<<<< HEAD
      let saved = false;
      if (typeof onSubmit === 'function') {
        try {
          await onSubmit(formData);
          saved = true;
        } catch (apiError) {
          console.warn('API save failed, falling back to direct Firestore save.', apiError);
        }
      }

      if (!saved) {
        const now = new Date();
        const collectionName = isElder ? 'elders' : 'orphans';
        await addDoc(collection(db, 'profiles'), {
          ...formData,
          createdAt: now,
          updatedAt: now,
        });
        await addDoc(collection(db, collectionName), {
          ...formData,
          createdAt: now,
          updatedAt: now,
        });
      }
=======
      await addDoc(collection(db, isElder ? 'elders' : 'orphans'), {
        ...formData,
        createdAt: new Date(),
      });
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d

      console.log('Saved successfully');
      alert('Data added successfully');
      setForm(initialForm);
<<<<<<< HEAD
      setHobbyDropdownOpen(false);
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
      onClose?.();
    } catch (saveError) {
      console.error(saveError);
      alert('Error saving data');
    }
  };

  const inputStyle = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
<<<<<<< HEAD
  const hobbyPlaceholder = form.hobbies.length
    ? form.hobbies.map((item) => item[0].toUpperCase() + item.slice(1)).join(', ')
    : 'Select hobbies';
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 sm:p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={updateField} className={inputStyle} />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={updateField} className={inputStyle} />
<<<<<<< HEAD
          <select name="gender" value={form.gender} onChange={updateField} className={inputStyle}>
            <option value="">Gender</option>
            {genderOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
=======
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
          <select name="personalityType" value={form.personalityType} onChange={updateField} className={inputStyle}>
            <option value="">Personality Type</option>
            {personalityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="emotionalState" value={form.emotionalState} onChange={updateField} className={inputStyle}>
            <option value="">Emotional State</option>
            {emotionalStateOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="attachmentStyle" value={form.attachmentStyle} onChange={updateField} className={inputStyle}>
            <option value="">Attachment Style</option>
            {attachmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
<<<<<<< HEAD
          <div className="relative">
            <button
              type="button"
              onClick={() => setHobbyDropdownOpen((prev) => !prev)}
              className={`${inputStyle} text-left flex items-center justify-between`}
              aria-haspopup="listbox"
              aria-expanded={hobbyDropdownOpen}
            >
              <span className={form.hobbies.length ? 'text-slate-900' : 'text-slate-400'}>
                {hobbyPlaceholder}
              </span>
              <span className="text-slate-500">{hobbyDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {hobbyDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-300 bg-white shadow-lg p-2">
                <p className="px-2 py-1 text-xs text-slate-500">Hobbies</p>
                <div className="max-h-40 overflow-y-auto">
                  {interestOptions.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.hobbies.includes(value)}
                        onChange={() => toggleHobby(value)}
                      />
                      <span className="capitalize">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
=======
          <select multiple value={form.interests} onChange={updateInterests} className={`${inputStyle} h-24`} aria-label="Interests">
            {interestOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
          <select name="communicationStyle" value={form.communicationStyle} onChange={updateField} className={inputStyle}>
            <option value="">Communication Style</option>
            {communicationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select name="availability" value={form.availability} onChange={updateField} className={inputStyle}>
            <option value="">Availability</option>
            {availabilityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
<<<<<<< HEAD
          {!isElder && (
            <select name="traumaLevel" value={form.traumaLevel} onChange={updateField} className={inputStyle}>
              <option value="">Trauma Level</option>
              {traumaLevelOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          )}
=======
          <select name="traumaLevel" value={form.traumaLevel} onChange={updateField} className={inputStyle}>
            <option value="">Trauma Level</option>
            {traumaLevelOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
>>>>>>> 19f8b71913c1e5037a2c08cc577cce08b372d24d
          <select name="language" value={form.language} onChange={updateField} className={inputStyle}>
            <option value="">Language</option>
            {languageOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {isElder && (
            <>
              <select name="patienceLevel" value={form.patienceLevel} onChange={updateField} className={inputStyle}>
                <option value="">Patience Level</option>
                {patienceLevelOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <select name="healthCondition" value={form.healthCondition} onChange={updateField} className={inputStyle}>
                <option value="">Health Condition</option>
                {healthConditionOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </>
          )}
          {error && <p className="md:col-span-2 text-xs text-rose-600">{error}</p>}
          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
