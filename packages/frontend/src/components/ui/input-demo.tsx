"use client";
import { useState } from "react";
import { PlaceholderInput } from "./placeholder-input";
import { VanishInput } from "./vanish-input";
import Card from "./card";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export function InputDemo() {
  const [placeholderValue, setPlaceholderValue] = useState("");
  const [vanishValue, setVanishValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Input Components Demo
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Showcasing the Placeholder and Vanish input components with modern
            animations and interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Placeholder Input Demo */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Placeholder Input
                </h3>
                <p className="text-sm text-gray-600">
                  Floating label animation
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PlaceholderInput
                value={placeholderValue}
                onChange={setPlaceholderValue}
                placeholder="Enter your name"
                className="mb-4"
              />

              <PlaceholderInput
                value={emailValue}
                onChange={setEmailValue}
                placeholder="Enter your email"
                type="email"
                className="mb-4"
              />

              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Features:</p>
                <ul className="space-y-1">
                  <li>• Floating label animation</li>
                  <li>• Focus state highlighting</li>
                  <li>• Smooth transitions</li>
                  <li>• Multiple input types</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Vanish Input Demo */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Vanish Input
                </h3>
                <p className="text-sm text-gray-600">
                  Show/hide content with toggle
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <VanishInput
                value={vanishValue}
                onChange={setVanishValue}
                placeholder="Enter your password"
                className="mb-4"
              />

              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Features:</p>
                <ul className="space-y-1">
                  <li>• Show/hide toggle button</li>
                  <li>• Clear button when typing</li>
                  <li>• Password masking</li>
                  <li>• Focus management</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card className="mt-8 p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Placeholder Input
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`<PlaceholderInput
  value={value}
  onChange={setValue}
  placeholder="Enter your name"
  disabled={false}
/>`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Vanish Input</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`<VanishInput
  value={value}
  onChange={setValue}
  placeholder="Enter password"
  showClearButton={true}
/>`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
