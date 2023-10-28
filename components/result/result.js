import { h } from 'https://esm.sh/preact@10.18.1';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(h);

export function Result(props) {
    console.log(props)
    return html`
        <div>dd</div>
    `;
}