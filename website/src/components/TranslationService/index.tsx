import React, { useContext, useRef, useState } from 'react';

import api from '../../services/api';

import Alert from '../Alert';
import DelayedDisplay from '../DelayedDisplay';

import { SocketContext } from '../../context/SocketContext';
import { config } from '../../config';

interface TranslationServiceProps {
    translateService?: string
    configLoaded: boolean
    updateConfig: (config: {translateService: '' | 'gcp' | 'local'}) => Promise<void>
    loadingImg: string
}

function TranslationService({ translateService, updateConfig, configLoaded, loadingImg }: TranslationServiceProps) {
    const { captionsStatus, reloadConfig } = useContext(SocketContext);

    const apiKeyInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
    const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    const sendApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newApiKey = apiKeyInputRef.current?.value;

        if (isLoadingSend || !newApiKey) return;
        
        setIsLoadingSend(true);

        DelayedDisplay({
            requestFn: async () => {
                await api('secrets', { method: 'POST', body: { type: 'gcpKey', value: newApiKey } });
                await updateConfig({translateService: 'gcp'});
                await new Promise((res)=>setTimeout(res, 100));
                reloadConfig();
            },
            successMessage: "The API key is working and has been saved", 
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingSend,
            setResponse: setResponse,
        });
    };

    const removeApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (isLoadingRemove) return;

        setIsLoadingRemove(true);

        DelayedDisplay({
            requestFn: async () => {
                await Promise.all([
                    api('secrets', { method: 'POST', body: { type: 'gcpKey' } }),
                    updateConfig({translateService: ''})
                ]);
                await new Promise((res)=>setTimeout(res, 100));
                reloadConfig();
            },
            successMessage: "The API key has been removed", 
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingRemove,
            setResponse: setResponse,
            setSuccessAction: () => {
                setIsEditing(false);
            }
        });
    };

    const enableLocalTranslation = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (isLoadingSend) return;

        setIsLoadingSend(true);

        DelayedDisplay({
            requestFn: async () => {
                await updateConfig({translateService: 'local'});
                await new Promise((res)=>setTimeout(res, 100));
                reloadConfig();
            },
            successMessage: "Local translation has been enabled",
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingSend,
            setResponse: setResponse,
        });
    };

    const closeResponse = () => {
        setResponse(null);
    };

    if (!configLoaded || !captionsStatus) return (
        <img src={loadingImg} alt="loading" className="loading-img" />
    );

    if(translateService && !isEditing) return (
        <>
            {response && (
                <Alert
                    type={(response.isSuccess) ? 'success' : 'error'}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}
            <div className="api-connected">
                <h4>
                    Connected: {translateService === 'local' ? 'Local translation' : 'Google Translation API'}
                </h4>
                <button className="theme-btn" onClick={() => setIsEditing(true)}><span>Change</span></button>
            </div>
        </>
    );

    return (
        <div className='api'>
            <p>
                You can use either local translation or Google Translation API.
            </p>
            <p>
                Local translation runs on your own computer and does not require a Google Cloud API key.
            </p>
            <button className="theme-btn" onClick={enableLocalTranslation} type="button">
                <span>{isLoadingSend ? 'Enabling...' : 'Use local translation'}</span>
            </button>
            <form className='api-form'>
                <p>Warning ! When using your own API keys, you are responsible for setting proper limits to avoid any unexpected billing</p>
                {response && (
                    <Alert
                        type={(response.isSuccess) ? 'success' : 'error'}
                        message={response.message}
                        onClose={closeResponse}
                    />
                )}
                <div className="api-input">
                    <input
                        ref={apiKeyInputRef}
                        type="password"
                        className="theme-input"
                        placeholder="Paste your API key here"
                    />
                    <button className="theme-btn" onClick={sendApiKey} type="submit">
                        <span>{isLoadingSend ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </form>
            <div className='api-info'>
                <a href={ config.github + '/wiki/Configure-translation' } target="_blank" rel="noreferrer">
                    &rarr; How to get an API key&nbsp;?
                </a>
                
                {isEditing && (
                    <button className="theme-btn danger-btn" onClick={removeApiKey} type="submit">
                        <span>{isLoadingRemove ? 'Removing...' : 'Remove my API key'} </span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default TranslationService;
