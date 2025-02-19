import 'src/app/component/structure/sw-admin';
import { shallowMount } from '@vue/test-utils';
import { BroadcastChannel } from 'worker_threads';

async function createWrapper(isLoggedIn, forwardLogout = () => {}, route = 'sw.wofoo.index') {
    return shallowMount(await Shopware.Component.build('sw-admin'), {
        stubs: {
            'sw-notifications': true,
            'sw-duplicated-media-v2': true,
            'sw-settings-cache-modal': true,
            'sw-license-violation': true,
            'sw-hidden-iframes': true,
            'sw-modals-renderer': true,
            'sw-app-wrong-app-url-modal': true,
            'router-view': true,
        },
        mocks: {
            $router: {
                currentRoute: {
                    name: route,
                },
            },
        },
        provide: {
            cacheApiService: {},
            extensionStoreActionService: {},
            licenseViolationService: {},
            userActivityService: {
                updateLastUserActivity: () => {
                    localStorage.setItem('lastActivity', 'foo');
                },
            },
            loginService: {
                isLoggedIn: () => isLoggedIn,
                forwardLogout,
            },
        },
        attachTo: document.body,
    });
}

describe('src/app/component/structure/sw-admin/index.ts', () => {
    let wrapper;

    beforeEach(() => {
        global.BroadcastChannel = BroadcastChannel;
    });

    afterEach(async () => {
        if (wrapper) {
            await wrapper.destroy();
        }

        await flushPromises();

        localStorage.removeItem('lastActivity');
    });

    it('should be a Vue.js component', async () => {
        wrapper = await createWrapper(false);

        expect(wrapper.vm).toBeTruthy();
    });

    it('should update user activity on click', async () => {
        wrapper = await createWrapper(false);

        const lastActivity = localStorage.getItem('lastActivity');

        const app = wrapper.find('#app');
        await app.trigger('mousemove');

        const newLastActivity = localStorage.getItem('lastActivity');

        expect(lastActivity).not.toBe(newLastActivity);
        expect(newLastActivity).toBe('foo');
    });

    it('should handle session_channel message', async () => {
        const forwardLogout = jest.fn();
        wrapper = await createWrapper(false, forwardLogout);

        const channel = new BroadcastChannel('session_channel');
        channel.postMessage({
            inactive: true,
        });

        await flushPromises();

        expect(forwardLogout).toHaveBeenCalledTimes(1);
        expect(forwardLogout).toHaveBeenCalledWith(true, true);
        channel.close();
    });

    it('should not handle session_channel message with improper event data', async () => {
        const forwardLogout = jest.fn();
        wrapper = await createWrapper(false, forwardLogout);

        const channel = new BroadcastChannel('session_channel');
        channel.postMessage(null);
        channel.postMessage({});

        await flushPromises();

        expect(forwardLogout).toHaveBeenCalledTimes(0);
        channel.close();
    });

    it('should not handle session_channel message on blocked route', async () => {
        const forwardLogout = jest.fn();
        wrapper = await createWrapper(false, forwardLogout, 'sw.login.index.login');

        const channel = new BroadcastChannel('session_channel');
        channel.postMessage({
            inactive: true,
        });

        await flushPromises();

        expect(forwardLogout).toHaveBeenCalledTimes(0);
        channel.close();
    });

    it('should not handle session_channel message on active', async () => {
        const forwardLogout = jest.fn();
        wrapper = await createWrapper(false, forwardLogout);

        const channel = new BroadcastChannel('session_channel');
        channel.postMessage({
            inactive: false,
        });

        await flushPromises();

        expect(forwardLogout).toHaveBeenCalledTimes(0);
        channel.close();
    });
});
