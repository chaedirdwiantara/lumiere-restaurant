import React from 'react'
import ElegantGallery from '../components/gallery/ElegantGallery'

const Gallery: React.FC = () => {
  const handleImageSelect = (image: any) => {
    console.log('Selected image:', image)
    // Handle image selection logic here
  }

  return (
    <div className="gallery-page">
      <ElegantGallery onImageSelect={handleImageSelect} />
    </div>
  )
}

export default Gallery