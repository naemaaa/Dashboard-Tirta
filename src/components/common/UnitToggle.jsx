// UnitToggle.jsx
// Pilihan satuan grafik: Ton (komoditas padat) atau Liter (minyak goreng).
// Dua satuan tidak pernah digambar di sumbu yang sama.

export function UnitToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#F2F4F7] p-0.5 rounded-lg border border-[#E4E7EC]" role="group" aria-label="Satuan grafik">
      {['Ton', 'Liter'].map(unit => (
        <button
          key={unit}
          type="button"
          onClick={() => onChange(unit)}
          aria-pressed={value === unit}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            value === unit ? 'bg-white text-[#0D3E77] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
