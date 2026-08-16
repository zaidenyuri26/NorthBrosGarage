import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import { SelectedVehicle } from '../components/FitmentSelector';
import { saveUserProfile } from '../lib/dbService';
import { useToast } from '../context/ToastContext';

export interface UseVehicleFitmentReturn {
  selectedVehicle: SelectedVehicle | null;
  setSelectedVehicle: React.Dispatch<React.SetStateAction<SelectedVehicle | null>>;
  updateVehicleFitment: (vehicle: SelectedVehicle | null) => Promise<void>;
  isSaving: boolean;
  saveSuccess: boolean;
}

/**
 * Custom hook that listens for vehicle fitment selector changes and
 * automatically persists the chosen vehicle to the user's Firestore profile.
 */
export function useVehicleFitment(
  user: UserProfile | null,
  onFitmentChange?: (vehicle: SelectedVehicle | null) => void
): UseVehicleFitmentReturn {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<SelectedVehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track the user UID to handle profile sync correctly
  const lastSyncedUidRef = useRef<string | null>(null);

  // 1. Restore vehicle fitment from user's Firestore profile on authentication / profile load
  useEffect(() => {
    if (user?.uid) {
      if (lastSyncedUidRef.current !== user.uid) {
        lastSyncedUidRef.current = user.uid;
        if (user.vehicleInfo?.make && user.vehicleInfo?.model) {
          const restoredVehicle: SelectedVehicle = {
            year: user.vehicleInfo.year || 'All Years',
            make: user.vehicleInfo.make,
            model: user.vehicleInfo.model,
          };
          setSelectedVehicle(restoredVehicle);
          if (onFitmentChange) {
            onFitmentChange(restoredVehicle);
          }
        }
      }
    } else {
      lastSyncedUidRef.current = null;
    }
  }, [user, onFitmentChange]);

  // 2. Listener / updater function to change fitment and persist to Firestore
  const updateVehicleFitment = useCallback(
    async (vehicle: SelectedVehicle | null) => {
      setSelectedVehicle(vehicle);

      if (onFitmentChange) {
        onFitmentChange(vehicle);
      }

      // If user is authenticated, save fitment directly to their Firestore profile document
      if (user?.uid) {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
          const updatedProfile: UserProfile = {
            ...user,
            vehicleInfo: vehicle
              ? {
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                }
              : undefined,
          };

          await saveUserProfile(updatedProfile);
          setSaveSuccess(true);

          if (vehicle) {
            toast.success(
              'Vehicle Saved',
              `Saved ${vehicle.year !== 'All Years' ? vehicle.year + ' ' : ''}${vehicle.make} ${vehicle.model} to your profile.`
            );
          } else {
            toast.info('Vehicle Cleared', 'Cleared vehicle fitment from profile.');
          }

          // Reset success state after a delay
          setTimeout(() => {
            setSaveSuccess(false);
          }, 3000);
        } catch (err) {
          console.error('Failed to update vehicle fitment in Firestore:', err);
          toast.error('Sync Error', 'Failed to save vehicle fitment to profile.');
        } finally {
          setIsSaving(false);
        }
      }
    },
    [user, toast, onFitmentChange]
  );

  return {
    selectedVehicle,
    setSelectedVehicle,
    updateVehicleFitment,
    isSaving,
    saveSuccess,
  };
}
