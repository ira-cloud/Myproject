import { render, fireEvent, screen } from '@testing-library/react-native';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';

describe('SymptomCheckIn', () => {
  it('toggles a tag into the selection when tapped', () => {
    const onChange = jest.fn();
    render(<SymptomCheckIn selected={[]} onChange={onChange} onSave={() => {}} />);
    fireEvent.press(screen.getByTestId('tag-bloating'));
    expect(onChange).toHaveBeenCalledWith(['bloating']);
  });

  it('toggles a tag out of the selection when tapped again', () => {
    const onChange = jest.fn();
    render(<SymptomCheckIn selected={['bloating']} onChange={onChange} onSave={() => {}} />);
    fireEvent.press(screen.getByTestId('tag-bloating'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('calls onSave when the save button is pressed', () => {
    const onSave = jest.fn();
    render(<SymptomCheckIn selected={['cramps']} onChange={() => {}} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('save-symptoms-button'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
