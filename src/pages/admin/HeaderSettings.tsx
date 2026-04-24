import React, { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"

const HeaderSettings = () => {
    const [enabled, setEnabled] = useState(true)
    const [bgColor, setBgColor] = useState("#000000")
    const [texts, setTexts] = useState<string[]>([""])

    // Load from Firebase
    useEffect(() => {
        const fetchData = async () => {
            const ref = doc(db, "settings", "header")
            const snap = await getDoc(ref)

            if (snap.exists()) {
                const data = snap.data()
                setEnabled(data.enabled ?? true)
                setBgColor(data.bgColor ?? "#000000")
                setTexts(data.texts ?? [""])
            }
        }

        fetchData()
    }, [])

    // Save to Firebase
    const handleTextChange = (index: number, value: string) => {
        const updated = [...texts]
        updated[index] = value
        setTexts(updated)
    }

    const addTextField = () => {
        setTexts([...texts, ""])
    }

    const removeTextField = (index: number) => {
        const updated = texts.filter((_, i) => i !== index)
        setTexts(updated)
    }
    const handleSave = async () => {
        await setDoc(doc(db, "settings", "header"), {
            enabled,
            bgColor,
            texts: texts.filter(t => t.trim() !== "") // clean empty
        })

        alert("Saved!")
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Header Settings</h1>

            {/* Toggle */}
            <div className="mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                    Enable Header
                </label>
            </div>

            {/* Background Color */}
            <div className="mb-4">
                <label className="block mb-1">Background Color</label>
                <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                />
            </div>

            {/* Text */}
            {/* <div className="mb-4">
                <label className="block mb-1">Announcement Text</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border px-3 py-2 w-full"
                />
            </div> */}
            <div className="mb-4">
                <label className="block mb-2 font-medium">Announcements</label>

                {texts.map((t, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={t}
                            onChange={(e) => handleTextChange(i, e.target.value)}
                            className="border px-3 py-2 w-full"
                            placeholder={`Text ${i + 1}`}
                        />

                        <button
                            onClick={() => removeTextField(i)}
                            className="px-3 bg-red-500 text-white rounded"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                <button
                    onClick={addTextField}
                    className="mt-2 px-4 py-2 bg-gray-200 rounded"
                >
                    + Add Text
                </button>
            </div>

            <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Save
            </button>
        </div>
    )
}

export default HeaderSettings;