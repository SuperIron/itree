/**
 * @author SuperIron
 * @update 2019/05/19
 * @contact 58218596@qq.com
 */

class Itree {
    constructor(options) {
        const { list, id = 'id', pid = 'pid', nopid = null, sort = false } = options;

        // inner data
        this._list = list;
        this._datas = this._clone(this._list);
        this._id = id;
        this._pid = pid;
        this._nopid = nopid;
        this._parentNotExist = [];
        this._sort = sort;

        // outer data
        this.tree = [];
        this.levelsMap = {};
        this.idsMap = {};
        this.pidsMap = {};
        this.ids = [];

        // init
        this._init();
    }

    /**
     * @description `Inner Methods`
     */

    _init() {
        this._foreachList(this._list);
        this._foreachTree(this.tree);
    }

    _foreachList(list) {
        list.forEach(item => {
            let o = this._clone(item);
            o.children = [];

            if (item[this._pid] === this._nopid) {
                this._del(item, () => {
                    this.tree.push(o);
                });
            } else {
                if (!this._isParentExist(item)) {
                    // 剔除掉pid不存在的数据

                    this._del(item);
                    this._parentNotExist.push(item);

                    console.error(`${this._pid}: ${item[this._pid]} is not exist`);
                } else {
                    this._setTree(this.tree, o);
                }
            }
        });

        this._datas.length > 0 && this._foreachList(this._datas);
    }
    /**
     * @description 判断父级数据是否存在
     *
     * @param {Object} self 自身数据
     */
    _isParentExist(self) {
        let exist = false;
        for (let i = 0; i < this._list.length; i++) {
            const item = this._list[i];

            if (self[this._pid] === item[this._id]) exist = true;
        }
        return exist;
    }

    _setTree(tree, o) {
        tree.forEach(item => {
            if (item[this._id] === o[this._pid]) {
                this._del(o, () => {
                    item.children.push(o);
                });
            } else {
                item.children.length > 0 && this._setTree(item.children, o);
            }
        });
    }

    _del(o, callback) {
        for (let i = 0; i < this._datas.length; i++) {
            const _data = this._datas[i];
            if (_data[this._id] === o[this._id]) {
                this._datas.splice(i, 1);
                typeof callback === 'function' && callback();
                break;
            }
        }
    }

    _foreachTree(list) {
        list.forEach(item => {
            const _id = item[this._id];
            const _pid = item[this._pid];

            if (item.children.length > 0 && this._sort !== false) {
                item.children = item.children.sort((a, b) => {
                    const sort = this._sort;

                    return a[sort] - b[sort];
                });
            }

            this.idsMap[_id] = item; //set idsMap
            this._setPidsMap(item, _pid); //set pidsMap
            this.ids.push(_id); //set ids

            //set levelsMap
            if (this.levelsMap[_pid] === undefined) {
                item.level = this.levelsMap[_id] = 1;
            } else {
                item.level = this.levelsMap[_id] = this.levelsMap[_pid] + 1;
            }

            item.children.length > 0 && this._foreachTree(item.children);
        });
    }

    _setPidsMap(item, _pid) {
        if (_pid === this._nopid) {
            return;
        }

        this.pidsMap[_pid] === undefined && (this.pidsMap[_pid] = []);
        this.pidsMap[_pid].push(item);
    }

    _clone(data) {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * @description `Outer Methods`
     */

    /**
     * @description 获取pid不存在的数据
     */
    getParentNotExist(callback) {
        typeof callback === 'function' && callback(this._parentNotExist);
    }
}
