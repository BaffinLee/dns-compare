import { h } from 'https://esm.sh/preact@10.18.1';
import htm from 'https://esm.sh/htm@3.1.1';
import { useCallback, useState, useEffect } from 'https://esm.sh/preact@10.18.1/hooks';

const html = htm.bind(h);

const TYPES = [
    { type: 'A', name: 'ipv4' },
    { type: 'AAAA', name: 'ipv6' },
];

export function Type(props) {
    const [visible, setVisible] = useState(false);

    const handleClick = useCallback((event) => {
        const type = event.target.textContent;
        if (props.value !== type) {
            props.onChange(type);
        }
    }, [props.onChange, props.value]);

    useEffect(() => {
        if (props.groups.length) {
            setVisible(true);
        }
    }, [props.groups, setVisible]);

    return html`
        <div class=${'address-type' + (visible ? ' visible' : '')}>
            ${TYPES.map(item => html`
                <button
                    onClick=${handleClick}
                    title=${item.name + ' address'}
                    class=${item.type === props.value ? 'selected' : ''}
                    key=${item.type}
                >${item.type}</button>
            `)}
        </div>
    `;
}