import { TiPlus } from 'react-icons/ti';

const LandingActionButton = ({ onAddNote }) => (
  <div
    className="size-fit cursor-pointer rounded-full border-8 border-white hover:border-yellow-200 active:border-yellow-200"
    onClick={onAddNote}
  >
    <div className="size-fit cursor-pointer rounded-full border-8 border-black bg-white p-2">
      <TiPlus className="size-12 fill-black" />
    </div>
  </div>
);

export default LandingActionButton;
