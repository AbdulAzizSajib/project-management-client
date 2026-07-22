import React from "react";

/*
  Mention format: "@[Name](userId)"
  - render: raw text ke React node e vange, mention gulo highlighted span kore
  - detect: input e "@word" khoje (dropdown trigger e lage)
*/

const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

// comment text ke render korar jonno — mention gulo sundor kore dekhai
export const renderCommentContent = (content) => {
    if (!content) return null;

    const nodes = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    // regex stateful — protibar notun kore chalai
    MENTION_REGEX.lastIndex = 0;
    while ((match = MENTION_REGEX.exec(content)) !== null) {
        // mention er age er sadha text
        if (match.index > lastIndex) {
            nodes.push(content.slice(lastIndex, match.index));
        }
        // mention nijei — shudhu name dekhai (@Name), highlighted
        nodes.push(
            <span
                key={`m-${key++}`}
                className="text-primary-600 dark:text-primary-400 font-medium bg-primary-500/10 rounded px-1"
            >
                @{match[1]}
            </span>
        );
        lastIndex = match.index + match[0].length;
    }

    // sesh mention er por baki text
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex));
    }

    return nodes;
};

// textarea er caret er age "@word" ache kina detect kore।
// thakle { query, start } fero — query diye member filter, start diye replace।
export const detectMentionQuery = (text, caretPos) => {
    const upto = text.slice(0, caretPos);
    // sesh "@" er por space chara word (name er moddhe space thakleও prothom word e trigger)
    const match = upto.match(/@([\w]*)$/);
    if (!match) return null;
    return {
        query: match[1], // "@" er por ja type kora hoyeche
        start: caretPos - match[0].length, // "@" er position
    };
};
