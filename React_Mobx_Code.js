import ShopItem from "models/ShopItem";
import { observable, action, computed } from "mobx";
import agent from "utils/api";

export class ShopItemStore {

    @observable isLoading = false;
    @observable isWorking = false;
    @observable shopItemsRegistry = observable.map();

    @computed get all() {
        return this.shopItemsRegistry.values();
    };

    clear() {
        this.shopItemsRegistry.clear();
    }

    get(id) {     
        return this.shopItemsRegistry.get(id);
    }

    $req() {
        return agent.ShopItem.all();
    }

    @action loadAll() {
        this.isLoading = true;
        return this.$req()
            .then(action((shopItems) => {
                this.shopItemsRegistry.clear();
                shopItems.forEach(shopItem => this.shopItemsRegistry.set(shopItem.id, ShopItem.fromApi(shopItem)));
            }))
            .finally(action(() => { this.isLoading = false; }));
    }

    @action load(id, { acceptCached = false } = {}) {
        if (acceptCached) {
            const shopItem = this.get(id);
            if (shopItem) return Promise.resolve(shopItem);
        }
        this.isLoading = true;
        return agent.ShopItem.get(id)
            .then(action((shopItem) => {
                const shopItemObj = ShopItem.fromApi(shopItem);
                this.shopItemsRegistry.set(shopItem.id, shopItemObj);
                return shopItemObj;
            }))
            .finally(action(() => { this.isLoading = false; }));
    }

    @action create(shopItem) {
        this.isWorking = true;
        return agent.ShopItem.create(shopItem)
            .then((shopItem) => {
                this.shopItemsRegistry.set(shopItem.id, shopItem);
                return shopItem;
            })
            .catch(err => { throw err; })
            .finally(action(() => { this.isWorking = false; }));
    }

    @action update(data) {
        this.isWorking = true;
        return agent.ShopItem.update(data)
            .then((shopItem) => {
                this.shopItemsRegistry.set(shopItem.id, shopItem);
                //this.load(data.id);
                return shopItem;
            })
            .catch(action(err => { throw err; }))
            .finally(action(() => { this.isWorking = false; }));
    }

    @action delete(id) {
        this.isWorking = true;
        this.shopItemsRegistry.delete(id);
        return agent.ShopItem.del(id)
            .then(() => this.loadShopItems())
            .catch(action(err => { throw err; }))
            .finally(action(() => { this.isWorking = false; }));
    }

}

export default new ShopItemStore();
