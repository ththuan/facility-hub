'use client'

import { useState } from 'react'

export default function TestInputPage() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: ''
  })

  console.log('🔄 Component rendered. States:', { text1, text2, formData })

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">🧪 Test Input Issues</h1>
      
      {/* Test 1: Simple useState */}
      <div className="border p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test 1: Simple useState</h3>
        <input
          type="text"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          placeholder="Type here..."
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <p className="text-sm text-gray-600 mt-2">Value: "{text1}"</p>
      </div>

      {/* Test 2: useState with callback */}
      <div className="border p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test 2: useState with callback</h3>
        <input
          type="text"
          value={text2}
          onChange={(e) => setText2(prev => e.target.value)}
          placeholder="Type here..."
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <p className="text-sm text-gray-600 mt-2">Value: "{text2}"</p>
      </div>

      {/* Test 3: Object state (like devices form) */}
      <div className="border p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test 3: Object state (như form thiết bị)</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Device name..."
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
          
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Device code..."
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
          
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Device category..."
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <p>Name: "{formData.name}"</p>
          <p>Code: "{formData.code}"</p>
          <p>Category: "{formData.category}"</p>
        </div>
      </div>

      {/* Debug info */}
      <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-2">🔍 Debug Info</h3>
        <pre className="text-xs overflow-auto">
{JSON.stringify({ text1, text2, formData }, null, 2)}
        </pre>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          📝 Hãy thử gõ nhiều ký tự vào các input trên. 
          Nếu chỉ nhập được 1 ký tự thì có lỗi React state.
        </p>
      </div>
    </div>
  )
}
