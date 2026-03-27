import React from 'react';

export default function ProfileCard({ profile }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        {profile.name || profile.fullName || 'Unnamed'}
      </h3>
      <p className="text-xs text-slate-500 capitalize">{profile.institutionType || profile.type}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
        <span>Age: {profile.age ?? '-'}</span>
        <span>Language: {profile.language || '-'}</span>
        <span>Emotion: {profile.emotionalState || '-'}</span>
        <span>Attachment: {profile.attachmentStyle || '-'}</span>
      </div>
    </div>
  );
}
// import React from 'react';

// export default function ProfileCard({ profile }) {
//   // Prevent crash if profile is undefined
//   if (!profile) {
//     return <div>No profile data</div>;
//   }

//   // Handle arrays safely
//   const languageDisplay = Array.isArray(profile.languages)
//     ? profile.languages.join(', ')
//     : profile.language || '-';

//   const emotionDisplay = Array.isArray(profile.emotional_needs)
//     ? profile.emotional_needs.join(', ')
//     : profile.emotionalState || '-';

//   return (
//     <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
//       <h3 className="text-base font-semibold text-slate-900">
//         {profile.name || profile.fullName || 'Unnamed'}
//       </h3>

//       <p className="text-xs text-slate-500 capitalize">
//         {profile.institutionType || profile.type || '-'}
//       </p>

//       <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
//         <span>Age: {profile.age ?? '-'}</span>
//         <span>Gender: {profile.gender || '-'}</span>
//         <span>Language: {languageDisplay}</span>
//         <span>Emotion: {emotionDisplay}</span>
//         <span>Attachment: {profile.attachmentStyle || '-'}</span>
//       </div>
//     </div>
//   );
// }