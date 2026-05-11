'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export const FirebaseErrorListener = () => {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a real production app, you might just log this. 
      // In development, we want to surface it clearly.
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: `Security rules blocked ${error.context.operation} on ${error.context.path}.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
};
