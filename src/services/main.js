const dayjs = require("dayjs");

const MainRepository = require("../repositories/main");

class MainService {
  mainRepository = new MainRepository();

  getBanner = async () => {
    const today = dayjs().format("YYYYMMDD");

    const allBanner = await this.mainRepository.allBanner(today);

    return allBanner;
  };

  getCategory = async () => {
    const allCategory = await this.mainRepository.allCategory();

    return allCategory;
  };
}

module.exports = MainService;
