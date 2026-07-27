// Ekta consistent color palette theke name er hash onujayi color bachi,
// jate ekই user/workspace shob jaygay ekই color pay (refresh e change hoy na).
const PALETTE = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-600",
    "bg-emerald-500", "bg-teal-500", "bg-cyan-600", "bg-sky-500",
    "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500",
    "bg-fuchsia-500", "bg-pink-500", "bg-rose-500",
];

const colorFor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
};

// src thakle image dekhai, na hole name er first letter diye ekta color avatar।
const Avatar = ({ src, name, className = "size-8 rounded-full", textSize = "text-xs" }) => {
    if (src) {
        return <img src={src} alt={name || "avatar"} className={`${className} object-cover`} />;
    }

    const letter = name?.trim()?.[0]?.toUpperCase() || "?";

    return (
        <div
            className={`${className} ${textSize} ${colorFor(name)} flex items-center justify-center font-semibold text-white select-none`}
        >
            {letter}
        </div>
    );
};

export default Avatar;
