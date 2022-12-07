"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.useFakeTimers();
const app_1 = require("../src/app");
const lodash_1 = require("lodash");
describe('verify swagger docs', () => {
    it('All routes should have swagger documentation', () => {
        const documentedRoutes = Object.keys(app_1.swaggerDocument.paths).sort();
        const allRoutes = [];
        app_1.gatewayApp._router.stack.forEach(function (middleware) {
            if (middleware.route) {
                allRoutes.push(middleware.route.path);
            }
            else if (middleware.name === 'router') {
                const parentPath = middleware.regexp
                    .toString()
                    .split('?')[0]
                    .slice(2)
                    .replaceAll('\\', '')
                    .slice(0, -1);
                middleware.handle.stack.forEach(function (handler) {
                    const route = handler.route;
                    if (route) {
                        route.path = `${parentPath}${route.path}`;
                        if (route.path.slice(-1) === '/')
                            route.path = route.path.slice(0, -1);
                        allRoutes.push(route.path);
                    }
                });
            }
        });
        allRoutes.sort();
        const routesNotDocumented = (0, lodash_1.difference)(allRoutes, documentedRoutes);
        expect(routesNotDocumented).toEqual([]);
    });
});
//# sourceMappingURL=app.test.js.map