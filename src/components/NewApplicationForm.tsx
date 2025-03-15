'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { useRouter } from 'next/navigation';

const AWS_REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'af-south-1', label: 'Africa (Cape Town)' },
  { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  { value: 'ca-central-1', label: 'Canada (Central)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-2', label: 'Europe (London)' },
  { value: 'eu-south-1', label: 'Europe (Milan)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'eu-north-1', label: 'Europe (Stockholm)' },
  { value: 'me-south-1', label: 'Middle East (Bahrain)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
];

export default function NewApplicationForm() {
  const router = useRouter();
  const [appName, setAppName] = useState('');
  const [appType, setAppType] = useState('');
  const [awsId, setAwsId] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [awsRegion, setAwsRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/create-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName,
          appType,
          ...(appType === 'aws-connect' && {
            awsId,
            awsSecret,
            awsRegion,
          }),
          ...(appType === 'csv' && file && {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application');
      }

      // Redirect to home page or dashboard
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-200">
        New Application
      </h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Application Name
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md 
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Application Type
          </label>
          <select
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
          >
            <option value="">Select type</option>
            <option value="csv">CSV</option>
            <option value="aws-connect">AWS Connect</option>
          </select>
        </div>

        {appType === 'aws-connect' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                AWS ID
              </label>
              <input
                type="text"
                value={awsId}
                onChange={(e) => setAwsId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                AWS Secret Key
              </label>
              <input
                type="password"
                value={awsSecret}
                onChange={(e) => setAwsSecret(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Region
              </label>
              <select
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              >
                <option value="">Select region</option>
                {AWS_REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {appType === 'csv' && (
          <div className="mt-6">
            <FileUpload onChange={(files) => setFile(files[0])} />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mt-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                   text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:ring-offset-2 transition-colors duration-200 relative"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              Creating...
            </span>
          ) : (
            'Create Application'
          )}
        </button>
      </form>
    </div>
  );
}