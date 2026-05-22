import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { HiUpload, HiTrash } from 'react-icons/hi'
import {
    getVideoUploadUrl,
    getUploadPreset,
    getCloudinaryVideoUrl
} from '../../lib/cloudinary'

type VideoUploadProps = {
    videos: string[]
    onVideosChange: (videos: string[]) => void
    maxVideos?: number
    label?: string
}


const VideoUpload: React.FC<VideoUploadProps> = ({
    videos,
    onVideosChange,
    maxVideos = 3,
    label = 'Upload Videos'
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files

        if (!files || files.length === 0) return

        if (videos.length + files.length > maxVideos) {
            toast.error(`Maximum ${maxVideos} videos allowed`)
            return
        }

        setUploading(true)

        try {
            const uploadedVideos: string[] = []

            for (const file of Array.from(files)) {
                const formData = new FormData()

                formData.append('file', file)
                formData.append('upload_preset', getUploadPreset())
                formData.append('folder', 'store/products/videos')

                const response = await fetch(
                    getVideoUploadUrl(),
                    {
                        method: 'POST',
                        body: formData
                    }

                )

                const data = await response.json()

                if (data.public_id) {
                    uploadedVideos.push(data.public_id)
                }
            }

            onVideosChange([...videos, ...uploadedVideos])

            toast.success('Videos uploaded successfully')
        } catch (error) {
            console.error(error)
            toast.error('Failed to upload videos')
        } finally {
            setUploading(false)
        }
    }

    const removeVideo = (index: number) => {
        const updated = videos.filter((_, i) => i !== index)
        onVideosChange(updated)
    }


    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                    <HiUpload className="w-5 h-5" />

                    {uploading ? 'Uploading...' : 'Upload Videos'}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    hidden
                    onChange={handleUpload}
                />
            </div>

            {videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video, index) => (
                        <div
                            key={index}
                            className="relative border rounded-xl overflow-hidden"
                        >
                            <video
                                src={getCloudinaryVideoUrl(video)}
                                controls
                                className="w-full h-64 object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                                <HiTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default VideoUpload