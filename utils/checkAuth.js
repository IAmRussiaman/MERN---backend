import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  //odvajamo rec Bearer iz req da bi ostao samo token

  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123');
      //dekodiramo token uz pomoc jwt verify i nase sifre
      req.userId = decoded._id; //iz dekodiranog tokena vadimo id i bacamo ga u request
      next();
    } catch (e) {
      return res.status(403).json({
        message: 'Dont have access', // ako nismo uspeli da dekodiramo token
      });
    }
  } else {
    return res.status(403).json({
      message: 'Dont have access', //ako nema tokena
    });
  }
};
