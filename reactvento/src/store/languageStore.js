import { useDispatch, useSelector } from 'react-redux';
import { setUpCollection } from './slices/languageSlice';

export const useSaveLanguage = () => {
    const dispatch = useDispatch();
    const saveLanguage = (languageData) => {
        dispatch(setUpCollection(languageData));
    };
    return saveLanguage;
};

export const useGetLanguage = () => {
    const language = useSelector(state => state.language.entries);
    return language;
};

