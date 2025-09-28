import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - Ever Works Template',
  description: 'Interactive API documentation for the Ever Works website template',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore and test the Ever Works website template APIs. This interactive documentation 
            allows you to understand and try out all available endpoints.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="/api/reference"
            className="w-full h-screen border-0"
            title="API Reference"
            style={{ minHeight: '800px' }}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This documentation is automatically generated from our OpenAPI specification.
            <br />
            For questions or support, please contact the Ever Works team.
          </p>
        </div>
      </div>
    </div>
  );
}
