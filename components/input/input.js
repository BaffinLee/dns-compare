import { h } from 'https://esm.sh/preact@10.18.1';
import htm from 'https://esm.sh/htm@3.1.1';
import { useCallback } from 'https://esm.sh/preact@10.18.1/hooks';

const html = htm.bind(h);

export function Input(props) {
    const handleInput = useCallback((event) => {
        props.onChange(event.target.value);
    }, [props.onChange]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter') {
            props.onEnter();
        }
    }, [props.onEnter]);

    return html`
        <input
            type="text"
            placeholder="Type a domain name, like google.com, hit Enter"
            onInput=${handleInput}
            onKeyDown=${handleKeyDown}
            value=${props.value}
            class="name-input"
            autofocus
        />
    `;
}
