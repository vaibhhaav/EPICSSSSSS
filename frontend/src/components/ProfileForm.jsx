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
const patienceLevelOptions = ['low', 'medium', 'high'];
const healthConditionOptions = ['good', 'moderate', 'critical'];

const initialForm = {
  name: '',
  age: '',
  gender: '',
  personalityType: '',
  emotionalState: '',
  attachmentStyle: '',
  interests: [],
  communicationStyle: '',
  availability: '',
  traumaLevel: '',
  language: '',
  patienceLevel: '',
  healthCondition: '',
};

export default function ProfileForm({ open, type, onClose, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isElder = type === 'elder';
  const title = useMemo(
    () => (isElder ? 'Add Elder Profile' : 'Add Orphan Profile'),
    [isElder]
  );

  if (!open) return null;

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Toggle hobbies (multi-select)
  const toggleInterest = (value) => {
    setForm((prev) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== value)
          : [...prev.interests, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const required = [
      'name',
      'age',
      'gender',
      'personalityType',
      'emotionalState',
      'attachmentStyle',
      'communicationStyle',
      'availability',
      'language',
    ];

    // ✅ Conditional required fields
    if (!isElder) required.push('traumaLevel'); // only for orphans
    if (isElder) required.push('patienceLevel', 'healthCondition'); // only for elders

    const missing = required.some((key) => !String(form[key]).trim());

    if (missing || form.interests.length === 0) {
      setError('Please complete all fields.');
      alert('Please complete all fields');
      return;
    }

    try {
      await addDoc(collection(db, isElder ? 'elders' : 'orphans'), {
        ...form,
        institutionType: type,
        age: Number(form.age),
        createdAt: new Date(),
      });

      alert('Saved successfully');
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  const inputStyle =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

        <form
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={updateField}
            className={inputStyle}
          />

          {/* Age */}
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={updateField}
            className={inputStyle}
          />

          {/* Gender */}
          <select
            name="gender"
            value={form.gender}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Personality */}
          <select
            name="personalityType"
            value={form.personalityType}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Personality Type</option>
            {personalityOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* Emotional State */}
          <select
            name="emotionalState"
            value={form.emotionalState}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Emotional State</option>
            {emotionalStateOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* Attachment */}
          <select
            name="attachmentStyle"
            value={form.attachmentStyle}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Attachment Style</option>
            {attachmentOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* ✅ HOBBIES DROPDOWN */}
          <div className="relative md:col-span-2">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`${inputStyle} text-left`}
            >
              {form.interests.length > 0
                ? form.interests.join(', ')
                : 'Select Hobbies'}
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow">
                {interestOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.interests.includes(item)}
                      onChange={() => toggleInterest(item)}
                      className="mr-2"
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Communication */}
          <select
            name="communicationStyle"
            value={form.communicationStyle}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Communication Style</option>
            {communicationOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* Availability */}
          <select
            name="availability"
            value={form.availability}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Availability</option>
            {availabilityOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* Language */}
          <select
            name="language"
            value={form.language}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Language</option>
            {languageOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* Trauma → Only Orphans */}
          {!isElder && (
            <select
              name="traumaLevel"
              value={form.traumaLevel}
              onChange={updateField}
              className={inputStyle}
            >
              <option value="">Trauma Level</option>
              {traumaLevelOptions.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          )}

          {/* Elder Only Fields */}
          {isElder && (
            <>
              <select
                name="patienceLevel"
                value={form.patienceLevel}
                onChange={updateField}
                className={inputStyle}
              >
                <option value="">Patience Level</option>
                {patienceLevelOptions.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              <select
                name="healthCondition"
                value={form.healthCondition}
                onChange={updateField}
                className={inputStyle}
              >
                <option value="">Health Condition</option>
                {healthConditionOptions.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="md:col-span-2 text-xs text-red-600">{error}</p>
          )}

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-3 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 // import React, { useMemo, useState } from 'react';
  // import { addDoc, collection } from 'firebase/firestore';
  // import { db } from './firebase.js';

  // const interestOptions = ['music', 'art', 'stories', 'games', 'nature', 'reading'];
  // const personalityOptions = ['introvert', 'ambivert', 'extrovert'];
  // const communicationOptions = ['verbal', 'non-verbal', 'mixed'];
  // const emotionalStateOptions = ['calm', 'anxious', 'sad', 'happy', 'neutral', 'irritated'];
  // const attachmentOptions = ['secure', 'avoidant', 'ambivalent', 'disorganized', 'anxious'];
  // const availabilityOptions = ['morning', 'afternoon', 'evening'];
  // const traumaLevelOptions = ['none', 'mild', 'moderate', 'severe'];
  // const languageOptions = ['english', 'hindi', 'regional'];
  // const patienceLevelOptions = ['low', 'medium', 'high'];
  // const healthConditionOptions = ['good', 'moderate', 'critical'];

  // const initialForm = {
  //   name: '',
  //   age: '',
  //   personalityType: '',
  //   emotionalState: '',
  //   attachmentStyle: '',
  //   interests: [],
  //   communicationStyle: '',
  //   availability: '',
  //   traumaLevel: '',
  //   language: '',
  //   patienceLevel: '',
  //   healthCondition: '',
  // };

  // export default function ProfileForm({ open, type, onClose, onSubmit, loading }) {
  //   const [form, setForm] = useState(initialForm);
  //   const [error, setError] = useState('');

  //   const isElder = type === 'elder';
  //   const title = useMemo(() => (isElder ? 'Add Elder Profile' : 'Add Orphan Profile'), [isElder]);

  //   if (!open) return null;

  //   const updateField = (event) => {
  //     const { name, value } = event.target;
  //     setForm((prev) => ({ ...prev, [name]: value }));
  //   };

  //   const updateInterests = (event) => {
  //     const values = Array.from(event.target.selectedOptions).map((option) => option.value);
  //     setForm((prev) => ({ ...prev, interests: values }));
  //   };

  //   const handleSubmit = async (event) => {
  //     event.preventDefault();
  //     setError('');

  //     const required = [
  //       'name',
  //       'age',
  //       'personalityType',
  //       'emotionalState',
  //       'attachmentStyle',
  //       'communicationStyle',
  //       'availability',
  //       'traumaLevel',
  //       'language',
  //     ];

  //     if (isElder) required.push('patienceLevel', 'healthCondition');

  //     const missing = required.some((key) => !String(form[key]).trim());
  //     if (missing || form.interests.length === 0) {
  //       setError('Please complete all fields.');
  //       alert('Please complete all required fields');
  //       return;
  //     }

  //     const normalizedInterests = Array.isArray(form.interests)
  //       ? form.interests
  //       : String(form.interests)
  //           .split(',')
  //           .map((item) => item.trim())
  //           .filter(Boolean);

  //     const formData = {
  //       ...form,
  //       institutionType: type,
  //       name: String(form.name).trim(),
  //       personalityType: String(form.personalityType).trim(),
  //       emotionalState: String(form.emotionalState).trim(),
  //       attachmentStyle: String(form.attachmentStyle).trim(),
  //       interests: normalizedInterests,
  //       communicationStyle: String(form.communicationStyle).trim(),
  //       availability: String(form.availability).trim(),
  //       language: String(form.language).trim(),
  //       traumaLevel: String(form.traumaLevel).trim(),
  //       healthCondition: String(form.healthCondition || '').trim(),
  //       age: Number(form.age),
  //     };

  //     if (isElder) {
  //       formData.patienceLevel = String(form.patienceLevel).trim();
  //     }

  //     console.log('Submitting:', formData);

  //     try {
  //       await addDoc(collection(db, isElder ? 'elders' : 'orphans'), {
  //         ...formData,
  //         createdAt: new Date(),
  //       });

  //       console.log('Saved successfully');
  //       alert('Data added successfully');
  //       setForm(initialForm);
  //       onClose?.();
  //     } catch (saveError) {
  //       console.error(saveError);
  //       alert('Error saving data');
  //     }
  //   };

  //   const inputStyle = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
  //       <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 sm:p-5 shadow-lg">
  //         <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
  //         <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
  //           <input name="name" placeholder="Name" value={form.name} onChange={updateField} className={inputStyle} />
  //           <input name="age" type="number" placeholder="Age" value={form.age} onChange={updateField} className={inputStyle} />
  //           <select name="personalityType" value={form.personalityType} onChange={updateField} className={inputStyle}>
  //             <option value="">Personality Type</option>
  //             {personalityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="emotionalState" value={form.emotionalState} onChange={updateField} className={inputStyle}>
  //             <option value="">Emotional State</option>
  //             {emotionalStateOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="attachmentStyle" value={form.attachmentStyle} onChange={updateField} className={inputStyle}>
  //             <option value="">Attachment Style</option>
  //             {attachmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select multiple value={form.interests} onChange={updateInterests} className={`${inputStyle} h-24`} aria-label="Interests">
  //             {interestOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="communicationStyle" value={form.communicationStyle} onChange={updateField} className={inputStyle}>
  //             <option value="">Communication Style</option>
  //             {communicationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="availability" value={form.availability} onChange={updateField} className={inputStyle}>
  //             <option value="">Availability</option>
  //             {availabilityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="traumaLevel" value={form.traumaLevel} onChange={updateField} className={inputStyle}>
  //             <option value="">Trauma Level</option>
  //             {traumaLevelOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           <select name="language" value={form.language} onChange={updateField} className={inputStyle}>
  //             <option value="">Language</option>
  //             {languageOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //           </select>
  //           {isElder && (
  //             <>
  //               <select name="patienceLevel" value={form.patienceLevel} onChange={updateField} className={inputStyle}>
  //                 <option value="">Patience Level</option>
  //                 {patienceLevelOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //               </select>
  //               <select name="healthCondition" value={form.healthCondition} onChange={updateField} className={inputStyle}>
  //                 <option value="">Health Condition</option>
  //                 {healthConditionOptions.map((value) => <option key={value} value={value}>{value}</option>)}
  //               </select>
  //             </>
  //           )}
  //           {error && <p className="md:col-span-2 text-xs text-rose-600">{error}</p>}
  //           <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
  //             <button type="button" onClick={onClose} className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
  //             <button type="submit" disabled={loading} className="w-full sm:w-auto rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60">
  //               {loading ? 'Saving...' : 'Save Profile'}
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }
  // import React, { useMemo, useState } from 'react';
  // import { addDoc, collection } from 'firebase/firestore';
  // import { db } from './firebase.js';

  // const interestOptions = ['music', 'art', 'stories', 'games', 'nature', 'reading'];
  // const personalityOptions = ['introvert', 'ambivert', 'extrovert'];
  // const communicationOptions = ['verbal', 'non-verbal', 'mixed'];
  // const emotionalStateOptions = ['calm', 'anxious', 'sad', 'happy', 'neutral', 'irritated'];
  // const attachmentOptions = ['secure', 'avoidant', 'ambivalent', 'disorganized', 'anxious'];
  // const availabilityOptions = ['morning', 'afternoon', 'evening'];
  // const traumaLevelOptions = ['none', 'mild', 'moderate', 'severe'];
  // const languageOptions = ['english', 'hindi', 'regional'];
  // const genderOptions = ['male', 'female', 'other'];
  // const patienceLevelOptions = ['low', 'medium', 'high'];
  // const healthConditionOptions = ['good', 'moderate', 'critical'];

  // const initialForm = {
  //   name: '',
  //   age: '',
  //   gender: '',
  //   personalityType: '',
  //   emotionalState: '',
  //   attachmentStyle: '',
  //   hobbies: [],
  //   communicationStyle: '',
  //   availability: '',
  //   traumaLevel: '',
  //   language: '',
  //   patienceLevel: '',
  //   healthCondition: '',
  // };

  // export default function ProfileForm({ open, type, onClose, onSubmit, loading }) {
  //   const [form, setForm] = useState(initialForm);
  //   const [error, setError] = useState('');
  //   const [hobbyDropdownOpen, setHobbyDropdownOpen] = useState(false);

  //   const isElder = type === 'elder';
  //   const title = useMemo(() => (isElder ? 'Add Elder Profile' : 'Add Orphan Profile'), [isElder]);

  //   if (!open) return null;

  //   const updateField = (event) => {
  //     const { name, value } = event.target;
  //     setForm((prev) => ({ ...prev, [name]: value }));
  //   };

  //   const toggleHobby = (hobby) => {
  //     setForm((prev) => {
  //       const alreadySelected = prev.hobbies.includes(hobby);
  //       return {
  //         ...prev,
  //         hobbies: alreadySelected
  //           ? prev.hobbies.filter((item) => item !== hobby)
  //           : [...prev.hobbies, hobby],
  //       };
  //     });
  //   };

  //   const handleSubmit = async (event) => {
  //     event.preventDefault();
  //     setError('');

  //     const required = [
  //       'name',
  //       'age',
  //       'gender',
  //       'personalityType',
  //       'emotionalState',
  //       'attachmentStyle',
  //       'communicationStyle',
  //       'availability',
  //       'language',
  //     ];

  //     if (isElder) {
  //       required.push('patienceLevel', 'healthCondition');
  //     } else {
  //       required.push('traumaLevel');
  //     }

  //     const missing = required.some((key) => !String(form[key]).trim());
  //     if (missing || form.hobbies.length === 0) {
  //       setError('Please complete all fields.');
  //       return;
  //     }

  //     const formData = {
  //       ...form,
  //       type,
  //       name: form.name.trim(),
  //       age: Number(form.age),
  //       hobbies: form.hobbies,
  //       traumaLevel: isElder ? '' : form.traumaLevel,
  //     };

  //     try {
  //       const collectionName = isElder ? 'elders' : 'orphans';

  //       await addDoc(collection(db, collectionName), {
  //         ...formData,
  //         createdAt: new Date(),
  //       });

  //       alert('Saved successfully');
  //       setForm(initialForm);
  //       setHobbyDropdownOpen(false);
  //       onClose?.();
  //     } catch (err) {
  //       console.error(err);
  //       alert('Error saving data');
  //     }
  //   };

  //   const inputStyle = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

  //   const hobbyPlaceholder = form.hobbies.length
  //     ? form.hobbies.join(', ')
  //     : 'Select hobbies';

  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-black/40">
  //       <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
  //         <h2 className="text-lg font-bold">{title}</h2>

  //         <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-4">

  //           <input name="name" placeholder="Name" value={form.name} onChange={updateField} className={inputStyle} />
  //           <input name="age" type="number" placeholder="Age" value={form.age} onChange={updateField} className={inputStyle} />

  //           <select name="gender" value={form.gender} onChange={updateField} className={inputStyle}>
  //             <option value="">Gender</option>
  //             {genderOptions.map(v => <option key={v}>{v}</option>)}
  //           </select>

  //           <select name="personalityType" value={form.personalityType} onChange={updateField} className={inputStyle}>
  //             <option value="">Personality</option>
  //             {personalityOptions.map(v => <option key={v}>{v}</option>)}
  //           </select>

  //           <div className="relative col-span-2">
  //             <button type="button" onClick={() => setHobbyDropdownOpen(!hobbyDropdownOpen)} className={inputStyle}>
  //               {hobbyPlaceholder}
  //             </button>

  //             {hobbyDropdownOpen && (
  //               <div className="absolute bg-white border mt-1 w-full p-2">
  //                 {interestOptions.map(h => (
  //                   <label key={h} className="block">
  //                     <input
  //                       type="checkbox"
  //                       checked={form.hobbies.includes(h)}
  //                       onChange={() => toggleHobby(h)}
  //                     /> {h}
  //                   </label>
  //                 ))}
  //               </div>
  //             )}
  //           </div>

  //           <button type="submit" className="col-span-2 bg-blue-500 text-white p-2 rounded">
  //             Save
  //           </button>

  //           {error && <p className="col-span-2 text-red-500">{error}</p>}
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }