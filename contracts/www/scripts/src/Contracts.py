class Contracts:
    def __init__(
            self,
            router,
            zeroex,
            multichain):
        self.__router = router
        self.__zeroex = zeroex
        self.__multichain = multichain

    def router(self):
        return self.__router

    def zeroEx(self):
        return self.__zeroex

    def multichain(self):
        return self.__multichain
