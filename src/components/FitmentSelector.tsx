import React, { useState } from 'react';
import { Car, ChevronDown, CheckCircle2, RotateCcw } from 'lucide-react';

export interface SelectedVehicle {
  year: string;
  make: string;
  model: string;
}

interface FitmentSelectorProps {
  selectedVehicle: SelectedVehicle | null;
  onSelectVehicle: (vehicle: SelectedVehicle | null) => void;
  onFilterFitment: (modelKeyword: string) => void;
}

const VEHICLE_DATA: Record<string, Record<string, string[]>> = {
  Honda: {
    'Civic Type R': ['FL5 (2023+)', 'FK8 (2017-2021)', 'FD2 (2007-2011)', 'EK9 (1997-2000)'],
    'S2000': ['AP2 (2004-2009)', 'AP1 (2000-2003)'],
    'Integra Type R': ['DC5 (2002-2006)', 'DC2 (1995-2001)'],
    'NSX': ['NC1 (2017-2022)', 'NA1/NA2 (1990-2005)'],
  },
  Nissan: {
    'GT-R': ['R35 (2009-2024)', 'R34 Skyline (1999-2002)', 'R33 Skyline (1993-1998)', 'R32 Skyline (1989-1994)'],
    'Z / Fairlady': ['RZ34 (2023+)', '370Z Z34 (2009-2020)', '350Z Z33 (2003-2008)', '300ZX Z32 (1990-1996)'],
    'Silvia / 240SX': ['S15 (1999-2002)', 'S14 (1994-1998)', 'S13 (1989-1993)'],
  },
  Toyota: {
    'GR Supra': ['A90 / A91 (2020+)', 'JZA80 MK4 (1993-2002)'],
    'GR86 / GT86': ['GR86 ZN8 (2022+)', 'GT86 ZN6 (2012-2021)'],
    'GR Yaris': ['GXPA16 (2020+)'],
    'GR Corolla': ['GZEA14 (2023+)'],
  },
  Subaru: {
    'WRX STI': ['VB (2022+)', 'VA (2015-2021)', 'GR/GV (2008-2014)', 'GD (2002-2007)'],
    'BRZ': ['ZD8 (2022+)', 'ZC6 (2013-2021)'],
  },
  Mazda: {
    'RX-7': ['FD3S (1992-2002)', 'FC3S (1986-1991)'],
    'MX-5 Miata': ['ND (2016+)', 'NC (2006-2015)', 'NA/NB (1989-2005)'],
  },
  BMW: {
    'M3 / M4': ['G80/G82 (2021+)', 'F80/F82 (2014-2020)', 'E90/E92 (2008-2013)', 'E46 (2001-2006)'],
    'M2': ['G87 (2023+)', 'F87 (2016-2021)'],
  },
};

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2015', '2010', '2005', '2000', '1998', '1995', '1992', '1990'];

export const FitmentSelector: React.FC<FitmentSelectorProps> = ({
  selectedVehicle,
  onSelectVehicle,
  onFilterFitment,
}) => {
  const [year, setYear] = useState<string>(selectedVehicle?.year || '');
  const [make, setMake] = useState<string>(selectedVehicle?.make || '');
  const [model, setModel] = useState<string>(selectedVehicle?.model || '');

  const availableMakes = Object.keys(VEHICLE_DATA);
  const availableModels = make && VEHICLE_DATA[make] ? Object.keys(VEHICLE_DATA[make]) : [];

  const handleApplyFitment = () => {
    if (!make || !model) return;
    const vehicleObj = { year: year || 'All Years', make, model };
    onSelectVehicle(vehicleObj);
    onFilterFitment(model);
  };

  const handleReset = () => {
    setYear('');
    setMake('');
    setModel('');
    onSelectVehicle(null);
    onFilterFitment('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden text-left">
      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                <span>SELECT YOUR VEHICLE</span>
                <span className="text-[11px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-black">100% FITMENT GUARANTEE</span>
              </h3>
              <p className="text-sm text-zinc-400">Verify guaranteed direct bolt-on fitment for performance parts</p>
            </div>
          </div>

          {selectedVehicle && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm font-mono text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Vehicle
            </button>
          )}
        </div>

        {/* Selected Active Vehicle Bar */}
        {selectedVehicle ? (
          <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-mono">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-zinc-400">Active Fitment Filter:</span>
              <span className="font-bold text-white">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-[12px] font-mono text-amber-500 hover:underline uppercase font-bold"
            >
              Change Vehicle
            </button>
          </div>
        ) : (
          /* Selectors Grid */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Year Selector */}
            <div className="relative">
              <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">Year</label>
              <select
                value={year || ''}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl py-2.5 px-3 appearance-none focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="">Select Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 bottom-2.5 pointer-events-none" />
            </div>

            {/* Make Selector */}
            <div className="relative">
              <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">Make</label>
              <select
                value={make || ''}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel('');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl py-2.5 px-3 appearance-none focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="">Select Make</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 bottom-2.5 pointer-events-none" />
            </div>

            {/* Model Selector */}
            <div className="relative">
              <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">Model</label>
              <select
                disabled={!make}
                value={model || ''}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl py-2.5 px-3 appearance-none focus:outline-none focus:border-amber-500 disabled:opacity-40 font-mono"
              >
                <option value="">Select Model</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 bottom-2.5 pointer-events-none" />
            </div>

            {/* Apply Button */}
            <div className="flex items-end col-span-2 sm:col-span-1">
              <button
                type="button"
                onClick={handleApplyFitment}
                disabled={!make || !model}
                className="w-full bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-950 font-mono font-black py-2.5 px-4 rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
              >
                <span>Find Parts</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
