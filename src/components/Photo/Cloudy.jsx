import React from 'react'
import { CldUploadWidget } from 'next-cloudinary';

function Cloudy() {
  return (
    <div>
        <CldUploadWidget uploadPreset="next_cloudinary_app">
  {({ open }) => {
    return (
      <button onClick={() => open()}>
        Upload an Image
      </button>
    );
  }}
</CldUploadWidget>
    </div>
  )
}

export default Cloudy